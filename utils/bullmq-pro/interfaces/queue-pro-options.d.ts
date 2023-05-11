import { QueueOptions } from 'bullmq';
export interface QueueProOptions extends QueueOptions {
    isPro?: boolean;
}
