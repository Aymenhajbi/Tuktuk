import { Injectable } from '@nestjs/common';
import { OrchestratorActionType, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class OrchestratorRepository {
  constructor(private readonly prisma: PrismaService) {}

  createDecision(data: Prisma.OrchestratorDecisionCreateArgs) {
    return this.prisma.orchestratorDecision.create(data);
  }

  createCampaignTest(data: Prisma.CampaignTestCreateArgs) {
    return this.prisma.campaignTest.create(data);
  }

  createSystemEvent(data: Prisma.SystemEventCreateArgs) {
    return this.prisma.systemEvent.create(data);
  }

  buildActionType(shouldTestCampaign: boolean): OrchestratorActionType {
    return shouldTestCampaign ? OrchestratorActionType.TEST_CAMPAIGN : OrchestratorActionType.SKIP;
  }
}
