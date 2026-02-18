import { Module } from '@nestjs/common';
import { AutoPricingController } from './auto-pricing.controller';
import { AutoPricingService } from './auto-pricing.service';
import { PricingRepository } from './pricing.repository';

@Module({
  controllers: [AutoPricingController],
  providers: [AutoPricingService, PricingRepository],
  exports: [AutoPricingService],
})
export class AutoPricingModule {}
