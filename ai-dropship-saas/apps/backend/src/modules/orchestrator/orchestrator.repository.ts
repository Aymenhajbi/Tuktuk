import { Injectable } from '@nestjs/common';
import { IdempotencyKey, OrchestratorActionType, Prisma, PrismaClient } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class OrchestratorRepository {
  constructor(private readonly prisma: PrismaService) {}

  inTransaction<T>(fn: (tx: Prisma.TransactionClient) => Promise<T>) {
    return this.prisma.$transaction(async (tx) => fn(tx));
  }

  createIdempotencyKey(key: string, context: string): Promise<IdempotencyKey> {
    return this.prisma.idempotencyKey.create({ data: { key, context } });
  }

  findIdempotencyKey(key: string): Promise<IdempotencyKey | null> {
    return this.prisma.idempotencyKey.findUnique({ where: { key } });
  }

  updateIdempotencyContext(key: string, context: string): Promise<IdempotencyKey> {
    return this.prisma.idempotencyKey.update({ where: { key }, data: { context } });
  }

  getDecisionById(id: string) {
    return this.prisma.orchestratorDecision.findUnique({ where: { id } });
  }

  createDecision(data: Prisma.OrchestratorDecisionCreateArgs, tx: Prisma.TransactionClient) {
    return tx.orchestratorDecision.create(data);
  }

  createCampaignTest(data: Prisma.CampaignTestCreateArgs, tx: Prisma.TransactionClient) {
    return tx.campaignTest.create(data);
  }

  createSystemEvent(data: Prisma.SystemEventCreateArgs, tx?: Prisma.TransactionClient) {
    if (tx) return tx.systemEvent.create(data);
    return this.prisma.systemEvent.create(data);
  }

  buildActionType(shouldTestCampaign: boolean): OrchestratorActionType {
    return shouldTestCampaign ? OrchestratorActionType.TEST_CAMPAIGN : OrchestratorActionType.SKIP;
  }
}
