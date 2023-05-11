import { WorkerOptions } from 'bullmq';
export interface JobTtlMap {
    [jobName: string]: number;
}
export interface WorkerProOptions extends WorkerOptions {
    ttl?: number | JobTtlMap;
    group?: {
        limit?: {
            max: number;
            duration: number;
        };
        /**
         * Amount of jobs that a single worker is allowed to work on
         * in parallel for a given group.
         *
         * @see {@link https://docs.bullmq.io/bullmq-pro/groups/concurrency}
         */
        concurrency?: number;
    };
}
