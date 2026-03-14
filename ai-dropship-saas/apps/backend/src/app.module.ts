import { Module } from '@nestjs/common';
import { WinningEngineModule } from './modules/winning-engine/winning-engine.module';
import { CompetitorIntelligenceModule } from './modules/competitor-intelligence/competitor-intelligence.module';
import { TiktokAnalyzerModule } from './modules/tiktok-analyzer/tiktok-analyzer.module';
import { AiCoreModule } from './modules/ai-core/ai-core.module';
import { AutoPricingModule } from './modules/auto-pricing/auto-pricing.module';
import { PrismaModule } from './prisma/prisma.module';
import { RealtimeGateway } from './websocket/realtime.gateway';
import { QueueModule } from './queue/queue.module';
import { OrchestratorModule } from './modules/orchestrator/orchestrator.module';

@Module({
  imports: [
    PrismaModule,
    QueueModule,
    WinningEngineModule,
    CompetitorIntelligenceModule,
    TiktokAnalyzerModule,
    AiCoreModule,
    AutoPricingModule,
    OrchestratorModule,
  ],
  providers: [RealtimeGateway],
})
export class AppModule {}
