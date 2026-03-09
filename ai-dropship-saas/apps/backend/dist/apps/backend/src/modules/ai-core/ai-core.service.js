"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiCoreService = void 0;
const common_1 = require("@nestjs/common");
const ai_repository_1 = require("./ai.repository");
let AiCoreService = class AiCoreService {
    constructor(repository) {
        this.repository = repository;
    }
    async generateMarketingAssets(productName) {
        const assets = {
            seoDescription: `${productName} améliore le quotidien avec un design innovant et une livraison rapide.`,
            tiktokHook: `Ce produit à moins de 30€ explose les ventes en ce moment 👀`,
            adAngles: ['Problem/Solution', 'UGC Demo', 'Before/After'],
            emailSubject: `${productName}: tendance e-commerce à surveiller`,
        };
        await this.repository.createAdCreative({
            data: {
                platform: 'tiktok',
                productRef: productName,
                hook: assets.tiktokHook,
                script: `${assets.tiktokHook}\n${assets.seoDescription}`,
            },
        });
        return assets;
    }
    predictTrend(signal) {
        const score = signal.trendVelocity * 0.7 + (100 - signal.competitionDensity) * 0.3;
        return { predictedDemandScore: Number(score.toFixed(2)), horizonDays: 14 };
    }
};
exports.AiCoreService = AiCoreService;
exports.AiCoreService = AiCoreService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [ai_repository_1.AiRepository])
], AiCoreService);
