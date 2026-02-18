export type EventVersion = 'v1';

export interface EventMetadata {
  version: EventVersion;
  correlationId: string;
  traceId: string;
  tenantId: string;
  occurredAt: string;
  idempotencyKey?: string;
}

export type EventType =
  | 'TrendSignalCreatedV1'
  | 'WinningScoreCreatedV1'
  | 'CampaignSimulationCompletedV1'
  | 'ProductSnapshotCreatedV1'
  | 'CampaignReadyV1';

export interface TrendSignalCreatedV1 {
  type: 'TrendSignalCreatedV1';
  metadata: EventMetadata;
  payload: {
    trendSignalId: string;
    productSnapshotId: string;
    keyword: string;
    trendVelocity: number;
  };
}

export interface WinningScoreCreatedV1 {
  type: 'WinningScoreCreatedV1';
  metadata: EventMetadata;
  payload: {
    winningScoreId: string;
    trendSignalId: string;
    score: number;
  };
}

export interface CampaignSimulationCompletedV1 {
  type: 'CampaignSimulationCompletedV1';
  metadata: EventMetadata;
  payload: {
    campaignSimulationId: string;
    productRef: string;
    expectedRoas: number;
    expectedCpa: number;
  };
}

export interface ProductSnapshotCreatedV1 {
  type: 'ProductSnapshotCreatedV1';
  metadata: EventMetadata;
  payload: {
    snapshotId: string;
    externalId: string;
    source: string;
  };
}

export interface CampaignReadyV1 {
  type: 'CampaignReadyV1';
  metadata: EventMetadata;
  payload: {
    snapshotId: string;
    readinessScore: number;
  };
}

export type DomainEvent =
  | TrendSignalCreatedV1
  | WinningScoreCreatedV1
  | CampaignSimulationCompletedV1
  | ProductSnapshotCreatedV1
  | CampaignReadyV1;
