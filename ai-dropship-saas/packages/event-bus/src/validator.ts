import { DomainEvent } from './contracts/events';
import { eventSchemas } from './contracts/schemas';

export function validateEvent(event: DomainEvent): void {
  if (!event.type || !event.metadata || !event.payload) {
    throw new Error('Invalid event envelope');
  }

  const schema = eventSchemas[event.type];
  if (!schema) {
    throw new Error(`No schema for event type ${event.type}`);
  }

  for (const key of schema.required) {
    if (!(key in event.payload)) {
      throw new Error(`Missing payload field: ${key}`);
    }
  }

  for (const [field, expectedType] of Object.entries(schema.payload)) {
    const value = (event.payload as Record<string, unknown>)[field];
    if (typeof value !== expectedType) {
      throw new Error(`Invalid payload type for ${field}: expected ${expectedType}`);
    }
  }

  if (event.metadata.version !== 'v1') {
    throw new Error('Unsupported event version');
  }
}
