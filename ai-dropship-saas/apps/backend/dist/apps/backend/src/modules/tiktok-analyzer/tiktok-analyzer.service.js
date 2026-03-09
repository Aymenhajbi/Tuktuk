"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TiktokAnalyzerService = void 0;
const common_1 = require("@nestjs/common");
let TiktokAnalyzerService = class TiktokAnalyzerService {
    detectVirality(video) {
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
};
exports.TiktokAnalyzerService = TiktokAnalyzerService;
exports.TiktokAnalyzerService = TiktokAnalyzerService = __decorate([
    (0, common_1.Injectable)()
], TiktokAnalyzerService);
