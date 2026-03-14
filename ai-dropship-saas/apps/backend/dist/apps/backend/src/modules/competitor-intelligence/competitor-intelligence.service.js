"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompetitorIntelligenceService = void 0;
const common_1 = require("@nestjs/common");
let CompetitorIntelligenceService = class CompetitorIntelligenceService {
    async collectSnapshot(storeUrl) {
        return {
            storeUrl,
            bestSellers: ['Portable Blender', 'Posture Corrector'],
            newProducts: ['Mini Sealer'],
            priceChanges: [{ product: 'Portable Blender', oldPrice: 29.99, newPrice: 24.99 }],
        };
    }
    async indexToElasticsearch(snapshot) {
        return {
            index: 'competitor_signals',
            documentId: `${snapshot.storeUrl}-${Date.now()}`,
            status: 'indexed',
        };
    }
};
exports.CompetitorIntelligenceService = CompetitorIntelligenceService;
exports.CompetitorIntelligenceService = CompetitorIntelligenceService = __decorate([
    (0, common_1.Injectable)()
], CompetitorIntelligenceService);
