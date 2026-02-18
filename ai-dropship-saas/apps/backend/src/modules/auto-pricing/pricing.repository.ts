import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PricingRepository {
  constructor(private readonly prisma: PrismaService) {}

  createCampaignSimulation(data: Prisma.CampaignSimulationCreateArgs) {
    return this.prisma.campaignSimulation.create(data);
  }
}
