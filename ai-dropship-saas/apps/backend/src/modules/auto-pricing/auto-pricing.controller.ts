import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AutoPricingService } from './auto-pricing.service';

@ApiTags('auto-pricing')
@Controller('modules/auto-pricing')
export class AutoPricingController {
  constructor(private readonly service: AutoPricingService) {}

  @Post('optimize')
  optimize(@Body() body: { cost: number; marketAverage: number; targetMarginPct: number; estimatedCpa: number }) {
    return this.service.optimize(body);
  }
}
