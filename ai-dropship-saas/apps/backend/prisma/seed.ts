import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  for (let i = 1; i <= 5; i += 1) {
    const externalId = `seed-product-${i}`;

    const snapshot = await prisma.productSnapshot.upsert({
      where: { externalId },
      update: { productName: `Seed Product ${i}`, source: 'seed' },
      create: {
        externalId,
        productName: `Seed Product ${i}`,
        source: 'seed',
      },
    });

    const trendSignal = await prisma.trendSignal.upsert({
      where: {
        source_keyword_productSnapshotId: {
          source: 'seed',
          keyword: `seed-keyword-${i}`,
          productSnapshotId: snapshot.id,
        },
      },
      update: {
        trendVelocity: 40 + i,
        engagementRate: 20 + i,
        competitionLevel: 30,
      },
      create: {
        source: 'seed',
        keyword: `seed-keyword-${i}`,
        trendVelocity: 40 + i,
        engagementRate: 20 + i,
        competitionLevel: 30,
        productSnapshotId: snapshot.id,
      },
    });

    await prisma.winningScore.upsert({
      where: { trendSignalId: trendSignal.id },
      update: {
        trendVelocity: 40 + i,
        engagementRate: 20 + i,
        adFrequency: 30 + i,
        marginPotential: 50 + i,
        supplierScore: 60,
        lowCompetitionFactor: 55,
        sentimentScore: 70,
        score: 62 + i,
      },
      create: {
        trendSignalId: trendSignal.id,
        trendVelocity: 40 + i,
        engagementRate: 20 + i,
        adFrequency: 30 + i,
        marginPotential: 50 + i,
        supplierScore: 60,
        lowCompetitionFactor: 55,
        sentimentScore: 70,
        score: 62 + i,
      },
    });

    const existingDecision = await prisma.orchestratorDecision.findFirst({
      where: { trendSignalId: trendSignal.id, reason: 'Seed baseline decision' },
    });

    if (!existingDecision) {
      await prisma.orchestratorDecision.create({
        data: {
          trendSignalId: trendSignal.id,
          actionType: 'SKIP',
          confidenceScore: 55,
          reason: 'Seed baseline decision',
        },
      });
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
