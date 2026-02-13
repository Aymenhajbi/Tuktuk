export interface DomainEvent<T = Record<string, unknown>> {
  type: string;
  tenantId: string;
  occurredAt: string;
  payload: T;
}

export function buildEvent<T>(type: string, tenantId: string, payload: T): DomainEvent<T> {
  return { type, tenantId, payload, occurredAt: new Date().toISOString() };
}
