import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CompetitorIntelligenceService } from './competitor-intelligence.service';

@ApiTags('competitor-intelligence')
@Controller('modules/competitor-intelligence')
export class CompetitorIntelligenceController {
  constructor(private readonly service: CompetitorIntelligenceService) {}

  @Get('scan')
  async scan(@Query('storeUrl') storeUrl: string) {
    const snapshot = await this.service.collectSnapshot(storeUrl);
    const indexed = await this.service.indexToElasticsearch(snapshot);
    return { snapshot, indexed };
  }
}
