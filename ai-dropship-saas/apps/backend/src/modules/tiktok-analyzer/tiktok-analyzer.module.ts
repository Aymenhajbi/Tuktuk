import { Module } from '@nestjs/common';
import { TiktokAnalyzerController } from './tiktok-analyzer.controller';
import { TiktokAnalyzerService } from './tiktok-analyzer.service';

@Module({
  controllers: [TiktokAnalyzerController],
  providers: [TiktokAnalyzerService],
})
export class TiktokAnalyzerModule {}
