import { Module } from '@nestjs/common';
import { CompetitorIntelligenceController } from './competitor-intelligence.controller';
import { CompetitorIntelligenceService } from './competitor-intelligence.service';

@Module({
  controllers: [CompetitorIntelligenceController],
  providers: [CompetitorIntelligenceService],
})
export class CompetitorIntelligenceModule {}
