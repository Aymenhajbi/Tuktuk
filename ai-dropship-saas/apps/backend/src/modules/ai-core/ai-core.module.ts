import { Module } from '@nestjs/common';
import { AiCoreController } from './ai-core.controller';
import { AiCoreService } from './ai-core.service';

@Module({
  controllers: [AiCoreController],
  providers: [AiCoreService],
  exports: [AiCoreService],
})
export class AiCoreModule {}
