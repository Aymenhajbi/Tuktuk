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
exports.OrchestratorRepository = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../prisma/prisma.service");
let OrchestratorRepository = class OrchestratorRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    inTransaction(fn) {
        return this.prisma.$transaction(async (tx) => fn(tx));
    }
    createIdempotencyKey(key, context) {
        return this.prisma.idempotencyKey.create({ data: { key, context } });
    }
    findIdempotencyKey(key) {
        return this.prisma.idempotencyKey.findUnique({ where: { key } });
    }
    updateIdempotencyContext(key, context) {
        return this.prisma.idempotencyKey.update({ where: { key }, data: { context } });
    }
    getDecisionById(id) {
        return this.prisma.orchestratorDecision.findUnique({ where: { id } });
    }
    createDecision(data, tx) {
        return tx.orchestratorDecision.create(data);
    }
    createCampaignTest(data, tx) {
        return tx.campaignTest.create(data);
    }
    createSystemEvent(data, tx) {
        if (tx)
            return tx.systemEvent.create(data);
        return this.prisma.systemEvent.create(data);
    }
    buildActionType(shouldTestCampaign) {
        return shouldTestCampaign ? client_1.OrchestratorActionType.TEST_CAMPAIGN : client_1.OrchestratorActionType.SKIP;
    }
};
exports.OrchestratorRepository = OrchestratorRepository;
exports.OrchestratorRepository = OrchestratorRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], OrchestratorRepository);
