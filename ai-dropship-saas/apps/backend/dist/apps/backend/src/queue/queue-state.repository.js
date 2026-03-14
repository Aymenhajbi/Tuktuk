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
exports.QueueStateRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let QueueStateRepository = class QueueStateRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    upsertPendingJob(input) {
        return this.prisma.queueJobState.upsert({
            where: { idempotencyKey: input.idempotencyKey },
            create: {
                queueName: input.queueName,
                idempotencyKey: input.idempotencyKey,
                correlationId: input.correlationId,
                traceId: input.traceId,
                tenantId: input.tenantId,
                status: 'PENDING',
            },
            update: {
                queueName: input.queueName,
                correlationId: input.correlationId,
                traceId: input.traceId,
                tenantId: input.tenantId,
                status: 'PENDING',
                startedAt: null,
                completedAt: null,
            },
        });
    }
    markStatus(input) {
        return this.prisma.queueJobState.update({
            where: { idempotencyKey: input.idempotencyKey },
            data: {
                status: input.status,
                retryCount: input.retryCount,
                failureCount: input.failureCount,
                lastError: input.lastError,
                startedAt: input.startedAt,
                completedAt: input.completedAt,
            },
        });
    }
};
exports.QueueStateRepository = QueueStateRepository;
exports.QueueStateRepository = QueueStateRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], QueueStateRepository);
