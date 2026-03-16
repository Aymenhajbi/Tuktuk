import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { TiktokAnalyzerService } from './tiktok-analyzer.service';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('tiktok-analyzer')
@Roles('ADMIN')
@Controller('modules/tiktok-analyzer')
export class TiktokAnalyzerController {
  constructor(private readonly service: TiktokAnalyzerService) {}

  @Post('score-viral')
  score(@Body() body: { views24h: number; comments: number; shares: number }) {
    return this.service.detectVirality(body);
  }
}
