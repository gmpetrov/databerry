import { QueueBase, QueueEvents, } from 'bullmq';

import { RedisConnectionPro } from './redis-connection-pro';
/**
 * @see {@link bullmq!QueueEvents | QueueEvents}
 */
export class QueueEventsPro extends QueueEvents {
    constructor(name, opts) {
        super(name, opts, RedisConnectionPro);
    }
    emit(event, ...args) {
        return QueueBase.prototype.emit.call(this, event, ...args);
    }
    off(eventName, listener) {
        QueueBase.prototype.off.call(this, eventName, listener);
        return this;
    }
    on(event, listener) {
        QueueBase.prototype.on.call(this, event, listener);
        return this;
    }
    once(event, listener) {
        QueueBase.prototype.once.call(this, event, listener);
        return this;
    }
}
//# sourceMappingURL=queue-events-pro.js.map