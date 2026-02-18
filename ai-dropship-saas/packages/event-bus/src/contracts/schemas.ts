import { EventType } from './events';

export type JsonSchema = {
  required: string[];
  payload: Record<string, 'string' | 'number'>;
};

export const eventSchemas: Record<EventType, JsonSchema> = {
  TrendSignalCreatedV1: {
    required: ['trendSignalId', 'productSnapshotId', 'keyword', 'trendVelocity'],
    payload: {
      trendSignalId: 'string',
      productSnapshotId: 'string',
      keyword: 'string',
      trendVelocity: 'number',
    },
  },
  WinningScoreCreatedV1: {
    required: ['winningScoreId', 'trendSignalId', 'score'],
    payload: {
      winningScoreId: 'string',
      trendSignalId: 'string',
      score: 'number',
    },
  },
  CampaignSimulationCompletedV1: {
    required: ['campaignSimulationId', 'productRef', 'expectedRoas', 'expectedCpa'],
    payload: {
      campaignSimulationId: 'string',
      productRef: 'string',
      expectedRoas: 'number',
      expectedCpa: 'number',
    },
  },
  ProductSnapshotCreatedV1: {
    required: ['snapshotId', 'externalId', 'source'],
    payload: {
      snapshotId: 'string',
      externalId: 'string',
      source: 'string',
    },
  },
  CampaignReadyV1: {
    required: ['snapshotId', 'readinessScore'],
    payload: {
      snapshotId: 'string',
      readinessScore: 'number',
    },
  },
};
