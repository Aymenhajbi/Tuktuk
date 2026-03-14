import { Module } from '@nestjs/common';
import { AiCoreModule } from '../ai-core/ai-core.module';
import { AutoPricingModule } from '../auto-pricing/auto-pricing.module';
import { WinningEngineModule } from '../winning-engine/winning-engine.module';
import { OrchestratorController } from './orchestrator.controller';
import { OrchestratorService } from './orchestrator.service';
import { OrchestratorRepository } from './orchestrator.repository';

@Module({
  imports: [WinningEngineModule, AiCoreModule, AutoPricingModule],
  controllers: [OrchestratorController],
  providers: [OrchestratorService, OrchestratorRepository],
})
export class OrchestratorModule {}
