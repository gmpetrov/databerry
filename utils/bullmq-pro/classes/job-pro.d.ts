import { Job, MinimalQueue, MoveToWaitingChildrenOpts } from 'bullmq';

import { ScriptsPro } from '../classes/scripts-pro';
import { JobProJsonRaw, JobsProOptions } from '../interfaces';
import { JobProJsonSandbox } from '../types';
/**
 * @see {@link bullmq!Job | Job}
 */
export declare class JobPro<DataType = any, ReturnType = any, NameType extends string = string> extends Job<DataType, ReturnType, NameType> {
    protected queue: MinimalQueue;
    id?: string;
    gid: string | number;
    opts: JobsProOptions;
    protected scripts: ScriptsPro;
    constructor(queue: MinimalQueue, 
    /**
     * The name of the Job
     */
    name: NameType, 
    /**
     * The payload for this job.
     */
    data: DataType, 
    /**
     * The options object for this job.
     */
    opts?: JobsProOptions, id?: string);
    /**
     * Instantiates a Job from a JobJsonRaw object (coming from a deserialized JSON object)
     *
     * @param queue - the queue where the job belongs to.
     * @param json - the plain object containing the job.
     * @param jobId - an optional job id (overrides the id coming from the JSON object)
     * @returns
     */
    static fromJSON<T = any, R = any, N extends string = string>(queue: MinimalQueue, json: JobProJsonRaw, jobId?: string): JobPro<T, R, N>;
    /**
     * Prepares a job to be passed to Sandbox.
     * @returns
     */
    asJSONSandbox(): JobProJsonSandbox;
    /**
     * Moves a job to the failed queue.
     *
     * @param err - the jobs error message.
     * @param token - token to check job is locked by current worker
     * @param fetchNext - true when wanting to fetch the next job
     * @returns void
     */
    moveToFailed(err: Error, token: string, fetchNext?: boolean): Promise<void>;
    /**
     * Moves the job to the waiting-children set.
     *
     * @param token - Token to check job is locked by current worker
     * @param opts - The options bag for moving a job to waiting-children.
     * @returns true if the job was moved
     */
    moveToWaitingChildren(token: string, opts?: MoveToWaitingChildrenOpts): Promise<boolean>;
    private saveStacktraceEx;
    /**
     * Moves the job to the delay set.
     *
     * @param timestamp - timestamp where the job should be moved back to "wait"
     * @param token - token to check job is locked by current worker
     * @returns
     */
    moveToDelayed(timestamp: number, token?: string): Promise<void>;
}
