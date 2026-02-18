import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';

describe('Orchestrator Integration', () => {
  let app: INestApplication;

  beforeAll(async () => {
    if (!process.env.DATABASE_URL) return;
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    if (app) await app.close();
  });

  it('runs full orchestrator flow', async () => {
    if (!app) return;
    await request(app.getHttpServer())
      .post('/modules/orchestrator/process-signal')
      .send({
        idempotencyKey: 'int-1',
        productId: 'prod-int-1',
        keyword: 'int-keyword',
        trendVelocity: 70,
        engagementRate: 70,
        adFrequency: 70,
        marginPotential: 70,
        supplierScore: 70,
        lowCompetitionFactor: 30,
        sentimentScore: 70,
        activeAdsCount: 10,
        competitorStoresCount: 10,
        priceCompression: 10,
      })
      .expect((res) => {
        expect([200, 201]).toContain(res.status);
      });
  });
});
