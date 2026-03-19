import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePromoCodeDto } from './dto/create-promo-code.dto';

@Injectable()
export class PromoCodesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreatePromoCodeDto) {
    const code = dto.code.toUpperCase().trim();
    return this.prisma.promoCode.create({
      data: {
        ...dto,
        code,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
        isActive: dto.isActive ?? true,
      },
    });
  }

  async findAll() {
    return this.prisma.promoCode.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async update(id: string, dto: Partial<CreatePromoCodeDto>) {
    const data: Record<string, unknown> = { ...dto };
    if (dto.code) data['code'] = dto.code.toUpperCase().trim();
    if (dto.expiresAt) data['expiresAt'] = new Date(dto.expiresAt);
    return this.prisma.promoCode.update({ where: { id }, data });
  }

  async remove(id: string) {
    return this.prisma.promoCode.delete({ where: { id } });
  }

  /** Public — validate a code and return the discount amount */
  async validate(code: string, orderTotal: number): Promise<{ discountAmount: number; promoCodeId: string }> {
    const promo = await this.prisma.promoCode.findUnique({
      where: { code: code.toUpperCase().trim() },
    });

    if (!promo) throw new NotFoundException('Promo code not found');
    if (!promo.isActive) throw new BadRequestException('This promo code is inactive');
    if (promo.expiresAt && promo.expiresAt < new Date()) throw new BadRequestException('This promo code has expired');
    if (promo.maxUses !== null && promo.maxUses !== undefined && promo.usedCount >= promo.maxUses) {
      throw new BadRequestException('This promo code has reached its maximum uses');
    }
    if (promo.minOrderAmount && orderTotal < promo.minOrderAmount) {
      throw new BadRequestException(`Minimum order amount for this code is AED ${promo.minOrderAmount.toFixed(2)}`);
    }

    const discountAmount = promo.discountType === 'PERCENTAGE'
      ? Math.min(orderTotal, orderTotal * (promo.discountValue / 100))
      : Math.min(orderTotal, promo.discountValue);

    return { discountAmount: Math.round(discountAmount * 100) / 100, promoCodeId: promo.id };
  }

  /** Called by order creation — validates and atomically increments usedCount */
  async applyToOrder(code: string, orderTotal: number): Promise<{ discountAmount: number; promoCodeId: string }> {
    const result = await this.validate(code, orderTotal);
    await this.prisma.promoCode.update({
      where: { id: result.promoCodeId },
      data: { usedCount: { increment: 1 } },
    });
    return result;
  }
}
