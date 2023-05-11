import { QueueEvents, QueueEventsListener,QueueEventsOptions } from 'bullmq';
/**
 * @see {@link bullmq!QueueEventsListener | QueueEventsListener}
 */
export interface QueueEventsListenerPro extends QueueEventsListener {
    /**
     * Listen to 'groups:paused' event.
     *
     * This event is triggered when a group is paused.
     */
    'groups:paused': (args: {
        groupId: string;
    }, id: string) => void;
    /**
     * Listen to 'groups:resumed' event.
     *
     * This event is triggered when a group is resumed.
     */
    'groups:resumed': (args: {
        groupId: string;
    }, id: string) => void;
}
/**
 * @see {@link bullmq!QueueEvents | QueueEvents}
 */
export declare class QueueEventsPro extends QueueEvents {
    constructor(name: string, opts?: QueueEventsOptions);
    emit<U extends keyof QueueEventsListenerPro>(event: U, ...args: Parameters<QueueEventsListenerPro[U]>): boolean;
    off<U extends keyof QueueEventsListenerPro>(eventName: U, listener: QueueEventsListenerPro[U]): this;
    on<U extends keyof QueueEventsListenerPro>(event: U, listener: QueueEventsListenerPro[U]): this;
    once<U extends keyof QueueEventsListenerPro>(event: U, listener: QueueEventsListenerPro[U]): this;
}
