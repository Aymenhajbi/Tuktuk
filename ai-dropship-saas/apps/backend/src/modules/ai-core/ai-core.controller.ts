import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AiCoreService } from './ai-core.service';

@ApiTags('ai-core')
@Controller('modules/ai-core')
export class AiCoreController {
  constructor(private readonly service: AiCoreService) {}

  @Post('generate-assets')
  generate(@Body() body: { productName: string }) {
    return this.service.generateMarketingAssets(body.productName);
  }

  @Post('predict-trend')
  predict(@Body() body: { trendVelocity: number; competitionDensity: number }) {
    return this.service.predictTrend(body);
  }
}
