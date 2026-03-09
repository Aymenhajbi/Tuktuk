"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.eventBus = exports.VersionedEventBus = void 0;
const events_1 = require("events");
const validator_1 = require("./validator");
class VersionedEventBus {
    constructor() {
        this.emitter = new events_1.EventEmitter();
    }
    publish(event) {
        (0, validator_1.validateEvent)(event);
        this.emitter.emit(event.type, event);
    }
    subscribe(eventType, handler) {
        const wrapped = async (event) => {
            (0, validator_1.validateEvent)(event);
            await handler(event);
        };
        this.emitter.on(eventType, wrapped);
        return () => this.emitter.off(eventType, wrapped);
    }
}
exports.VersionedEventBus = VersionedEventBus;
exports.eventBus = new VersionedEventBus();
