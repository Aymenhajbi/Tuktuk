import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import Stripe from 'stripe';

@Injectable()
export class PaymentsService {
  private readonly stripe: Stripe;
  private readonly logger = new Logger(PaymentsService.name);

  constructor(private readonly prisma: PrismaService) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2025-02-24.acacia',
    });
  }

  async createCheckoutSession(orderId: string, successUrl: string, cancelUrl: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { items: { include: { product: true } } },
    });
    if (!order) throw new BadRequestException('Order not found');

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = order.items.map(item => ({
      price_data: {
        currency: 'aed',
        product_data: {
          name: item.product.name,
          ...(item.product.images[0] ? { images: [item.product.images[0]] } : {}),
        },
        unit_amount: Math.round((item.product.salePrice ?? item.product.price) * 100),
      },
      quantity: item.quantity,
    }));

    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl,
      metadata: { orderId },
      customer_email: undefined, // caller can pass if needed
    });

    await this.prisma.order.update({
      where: { id: orderId },
      data: { stripeSessionId: session.id },
    });

    return { url: session.url, sessionId: session.id };
  }

  async handleWebhook(rawBody: Buffer, signature: string) {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    let event: Stripe.Event;

    try {
      if (webhookSecret) {
        event = this.stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
      } else {
        // Dev mode: no signature verification
        event = JSON.parse(rawBody.toString()) as Stripe.Event;
      }
    } catch (err) {
      this.logger.error('Webhook signature verification failed', err);
      throw new BadRequestException('Invalid webhook signature');
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderId = session.metadata?.orderId;
      if (orderId && session.payment_status === 'paid') {
        await this.prisma.order.update({
          where: { id: orderId },
          data: { status: 'PAID' },
        });
        this.logger.log(`Order ${orderId} marked PAID via webhook`);
      }
    }

    if (event.type === 'checkout.session.expired') {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderId = session.metadata?.orderId;
      if (orderId) {
        await this.prisma.order.update({
          where: { id: orderId },
          data: { status: 'FAILED' },
        });
      }
    }

    return { received: true };
  }

  // Called from the success page — confirms payment without needing Stripe CLI in dev
  async verifySession(sessionId: string) {
    const session = await this.stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status !== 'paid') return null;

    const orderId = session.metadata?.orderId;
    if (!orderId) return null;

    // Idempotent: update to PAID if still PENDING
    await this.prisma.order.updateMany({
      where: { id: orderId, status: 'PENDING' },
      data: { status: 'PAID' },
    });

    return this.prisma.order.findUnique({
      where: { id: orderId },
      include: { items: { include: { product: true } } },
    });
  }
}
