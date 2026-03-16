import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AutoPricingService } from './auto-pricing.service';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('auto-pricing')
@Roles('ADMIN')
@Controller('modules/auto-pricing')
export class AutoPricingController {
  constructor(private readonly service: AutoPricingService) {}

  @Post('optimize')
  async optimize(@Body() body: { cost: number; marketAverage: number; targetMarginPct: number; estimatedCpa: number }) {
    return this.service.optimize(body);
  }
}
