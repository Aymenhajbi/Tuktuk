import {
  Controller, Post, Get, Body, Query, RawBodyRequest, Req, Headers, HttpCode,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { PaymentsService } from './payments.service';
import { CreateCheckoutSessionDto } from './dto/create-checkout-session.dto';
import { Public } from '../auth/decorators/public.decorator';

const STOREFRONT = process.env.STOREFRONT_URL ?? 'http://localhost:3000';

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('create-checkout-session')
  createCheckoutSession(@Body() dto: CreateCheckoutSessionDto) {
    const successUrl = dto.successUrl ?? `${STOREFRONT}/payment/success`;
    const cancelUrl  = dto.cancelUrl  ?? `${STOREFRONT}/payment/cancel`;
    return this.paymentsService.createCheckoutSession(dto.orderId, successUrl, cancelUrl);
  }

  // Stripe sends raw body — must be @Public so JwtAuthGuard doesn't block it
  @Public()
  @Post('webhook')
  @HttpCode(200)
  webhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') sig: string,
  ) {
    return this.paymentsService.handleWebhook(req.rawBody!, sig);
  }

  // Success page calls this to confirm payment and get order details
  @Public()
  @Get('verify')
  verifySession(@Query('session_id') sessionId: string) {
    return this.paymentsService.verifySession(sessionId);
  }
}
