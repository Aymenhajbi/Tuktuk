import { EventEmitter } from 'events';
import { DomainEvent, EventType } from './contracts/events';
import { validateEvent } from './validator';

type Handler<T extends DomainEvent> = (event: T) => Promise<void> | void;

export class VersionedEventBus {
  private readonly emitter = new EventEmitter();

  publish(event: DomainEvent): void {
    validateEvent(event);
    this.emitter.emit(event.type, event);
  }

  subscribe<T extends DomainEvent>(eventType: EventType, handler: Handler<T>): () => void {
    const wrapped = async (event: DomainEvent) => {
      validateEvent(event);
      await handler(event as T);
    };

    this.emitter.on(eventType, wrapped);
    return () => this.emitter.off(eventType, wrapped);
  }
}

export const eventBus = new VersionedEventBus();
