import { Module } from '@nestjs/common';
import { AutoPricingController } from './auto-pricing.controller';
import { AutoPricingService } from './auto-pricing.service';

@Module({
  controllers: [AutoPricingController],
  providers: [AutoPricingService],
  exports: [AutoPricingService],
})
export class AutoPricingModule {}
