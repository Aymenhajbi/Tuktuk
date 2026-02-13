import { Module } from '@nestjs/common';
import { WinningEngineController } from './winning-engine.controller';
import { WinningEngineService } from './winning-engine.service';

@Module({
  controllers: [WinningEngineController],
  providers: [WinningEngineService],
  exports: [WinningEngineService],
})
export class WinningEngineModule {}
