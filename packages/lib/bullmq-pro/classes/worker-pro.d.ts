import { Worker } from 'bullmq';

import { ScriptsPro } from '../classes/scripts-pro';
import { WorkerProOptions } from '../interfaces';

import { JobPro } from './job-pro';
export declare type ProcessorPro<T = any, R = any, N extends string = string> = (job: JobPro<T, R, N>, token?: string) => Promise<R>;
/**
 * @see {@link bullmq!Worker | Worker}
 */
export declare class WorkerPro<DataType = any, ResultType = any, NameType extends string = string> extends Worker<DataType, ResultType, NameType> {
    opts: WorkerProOptions;
    protected scripts: ScriptsPro;
    static RateLimitError: typeof Worker.RateLimitError;
    constructor(name: string, processor?: string | ProcessorPro<DataType, ResultType, NameType>, opts?: WorkerProOptions);
    protected get Job(): typeof JobPro;
    protected callProcessJob(job: JobPro<DataType, ResultType, NameType>, token: string): Promise<ResultType>;
    /**
     * Store returnValue.
     *
     * @param jobId - Job identifier.
     * @param token - Token lock.
     * @param returnValue - The jobs success message.
     */
    private storeResult;
    /**
     * Overrides the rate limit so that it becomes active for the given group.
     *
     * @param job - Job currently being processed, and whose group we want to rate limit.
     * @param expireTimeMs - Expire time in ms of this rate limit.
     */
    rateLimitGroup(job: JobPro, expireTimeMs: number): Promise<void>;
}
