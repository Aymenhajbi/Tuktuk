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
exports.WinningRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let WinningRepository = class WinningRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    withClient(client) {
        return client ?? this.prisma;
    }
    createTrendAndWinningScore(payload, client) {
        const db = this.withClient(client);
        return (async () => {
            const snapshot = await db.productSnapshot.upsert({
                where: { externalId: payload.productExternalId },
                create: {
                    externalId: payload.productExternalId,
                    productName: payload.productName,
                    source: payload.source,
                },
                update: {
                    productName: payload.productName,
                    source: payload.source,
                },
            });
            const trendSignal = await db.trendSignal.upsert({
                where: {
                    source_keyword_productSnapshotId: {
                        source: payload.source,
                        keyword: payload.keyword,
                        productSnapshotId: snapshot.id,
                    },
                },
                create: {
                    source: payload.source,
                    keyword: payload.keyword,
                    trendVelocity: payload.trendVelocity,
                    engagementRate: payload.engagementRate,
                    competitionLevel: payload.competitionLevel,
                    productSnapshotId: snapshot.id,
                },
                update: {
                    trendVelocity: payload.trendVelocity,
                    engagementRate: payload.engagementRate,
                    competitionLevel: payload.competitionLevel,
                },
            });
            const winningScore = await db.winningScore.upsert({
                where: { trendSignalId: trendSignal.id },
                create: {
                    trendSignalId: trendSignal.id,
                    trendVelocity: payload.trendVelocity,
                    engagementRate: payload.engagementRate,
                    adFrequency: payload.adFrequency,
                    marginPotential: payload.marginPotential,
                    supplierScore: payload.supplierScore,
                    lowCompetitionFactor: payload.lowCompetitionFactor,
                    sentimentScore: payload.sentimentScore,
                    score: payload.score,
                },
                update: {
                    trendVelocity: payload.trendVelocity,
                    engagementRate: payload.engagementRate,
                    adFrequency: payload.adFrequency,
                    marginPotential: payload.marginPotential,
                    supplierScore: payload.supplierScore,
                    lowCompetitionFactor: payload.lowCompetitionFactor,
                    sentimentScore: payload.sentimentScore,
                    score: payload.score,
                },
            });
            return { snapshot, trendSignal, winningScore };
        })();
    }
};
exports.WinningRepository = WinningRepository;
exports.WinningRepository = WinningRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], WinningRepository);
