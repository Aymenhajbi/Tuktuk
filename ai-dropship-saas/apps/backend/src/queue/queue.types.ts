export interface QueueEnvelope<TPayload = Record<string, unknown>> {
  idempotencyKey: string;
  correlationId: string;
  traceId: string;
  tenantId: string;
  payload: TPayload;
}

export interface QueueMetricLog {
  queue: string;
  jobId: string;
  processingTime: number;
  retryCount: number;
  failureCount: number;
  status: 'completed' | 'failed' | 'stalled';
}
