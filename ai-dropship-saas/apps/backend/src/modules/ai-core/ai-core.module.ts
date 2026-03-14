import { Module } from '@nestjs/common';
import { AiCoreController } from './ai-core.controller';
import { AiCoreService } from './ai-core.service';
import { AiRepository } from './ai.repository';

@Module({
  controllers: [AiCoreController],
  providers: [AiCoreService, AiRepository],
  exports: [AiCoreService],
})
export class AiCoreModule {}
