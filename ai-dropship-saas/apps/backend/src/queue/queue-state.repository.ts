import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class QueueStateRepository {
  constructor(private readonly prisma: PrismaService) {}

  upsertPendingJob(input: {
    queueName: string;
    idempotencyKey: string;
    correlationId: string;
    traceId: string;
    tenantId: string;
  }) {
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

  markStatus(input: {
    idempotencyKey: string;
    status: string;
    retryCount?: number;
    failureCount?: number;
    lastError?: string;
    startedAt?: Date;
    completedAt?: Date;
  }) {
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
}
