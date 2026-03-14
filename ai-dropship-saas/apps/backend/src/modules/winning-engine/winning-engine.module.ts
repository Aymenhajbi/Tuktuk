import { Module } from '@nestjs/common';
import { WinningEngineController } from './winning-engine.controller';
import { WinningEngineService } from './winning-engine.service';
import { WinningRepository } from './winning.repository';

@Module({
  controllers: [WinningEngineController],
  providers: [WinningEngineService, WinningRepository],
  exports: [WinningEngineService],
})
export class WinningEngineModule {}
