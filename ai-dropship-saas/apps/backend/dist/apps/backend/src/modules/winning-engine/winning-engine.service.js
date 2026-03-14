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
exports.WinningEngineService = void 0;
const common_1 = require("@nestjs/common");
const winning_repository_1 = require("./winning.repository");
let WinningEngineService = class WinningEngineService {
    constructor(repository) {
        this.repository = repository;
    }
    assertScoreRange(score) {
        if (score < 0 || score > 100) {
            throw new common_1.BadRequestException('WinningScore.score must be between 0 and 100');
        }
    }
    buildWinningPayload(input) {
        const score = input.trendVelocity * 0.25 +
            input.engagementRate * 0.15 +
            input.adFrequency * 0.15 +
            input.marginPotential * 0.15 +
            input.supplierScore * 0.1 +
            input.lowCompetitionFactor * 0.1 +
            input.sentimentScore * 0.1;
        const normalizedScore = Number(score.toFixed(2));
        this.assertScoreRange(normalizedScore);
        return {
            productExternalId: input.productId,
            productName: input.productName ?? input.productId,
            source: input.source ?? 'unknown',
            keyword: input.keyword ?? input.productId,
            trendVelocity: input.trendVelocity,
            engagementRate: input.engagementRate,
            competitionLevel: 100 - input.lowCompetitionFactor,
            adFrequency: input.adFrequency,
            marginPotential: input.marginPotential,
            supplierScore: input.supplierScore,
            lowCompetitionFactor: input.lowCompetitionFactor,
            sentimentScore: input.sentimentScore,
            score: normalizedScore,
            decision: normalizedScore >= 70 ? 'IMPORT_SUGGESTED' : 'WATCHLIST',
        };
    }
    async calculateWinningScore(input, client) {
        const payload = this.buildWinningPayload(input);
        const persisted = await this.repository.createTrendAndWinningScore(payload, client);
        return {
            decision: payload.decision,
            snapshot: persisted.snapshot,
            trendSignal: persisted.trendSignal,
            winningScore: persisted.winningScore,
        };
    }
};
exports.WinningEngineService = WinningEngineService;
exports.WinningEngineService = WinningEngineService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [winning_repository_1.WinningRepository])
], WinningEngineService);
