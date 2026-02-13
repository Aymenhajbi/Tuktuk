import { Injectable } from '@nestjs/common';

@Injectable()
export class TiktokAnalyzerService {
  detectVirality(video: { views24h: number; comments: number; shares: number }) {
    const velocity = video.views24h / 10000;
    const engagement = (video.comments + video.shares) / Math.max(video.views24h, 1);
    const viralScore = Math.min(100, Number((velocity * 6 + engagement * 400).toFixed(2)));

    return {
      ...video,
      viralScore,
      ocrEnabled: true,
      frameAnalysisEnabled: true,
      transcriptAnalysisEnabled: true,
      qualifies: viralScore >= 70,
    };
  }
}
