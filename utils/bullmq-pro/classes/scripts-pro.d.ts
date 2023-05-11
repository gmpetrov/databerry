/// <reference types="node" />
import { FinishedPropValAttribute, FinishedStatus, JobState, KeepJobs, MinimalJob, MinimalQueue, MoveToWaitingChildrenOpts, Scripts } from 'bullmq';

import { GroupStatus } from '../enums/group-status';
/**
 * Implementation of the Scripts interface.
 * In the future we may refactor the Scripts interface in BullMQ so that extensions
 * can just extend the Scripts implementation and replace by its own commands.
 */
export declare class ScriptsPro extends Scripts {
    protected queue: MinimalQueue;
    constructor(queue: MinimalQueue);
    moveToDelayedProArgs(jobId: string, timestamp: number, token: string, gid: number | string): (string | number)[];
    moveToDelayedPro(jobId: string, timestamp: number, gid: number | string, token?: string): Promise<void>;
    retryJobProArgs(jobId: string, lifo: boolean, gid: number | string, token: string): (string | number)[];
    moveToActive(token: string, jobId?: string): Promise<any[]>;
    promote(jobId: string): Promise<number>;
    moveToFinished<DataType = any, ReturnType = any, NameType extends string = string>(jobId: string, args: (string | number | boolean | Buffer)[]): Promise<any[]>;
    moveToFailedArgs(job: MinimalJob, failedReason: string, removeOnFailed: boolean | number | KeepJobs, token: string, fetchNext?: boolean): string[];
    protected moveToFinishedArgs(job: MinimalJob, val: any, propVal: FinishedPropValAttribute, shouldRemove: undefined | boolean | number | KeepJobs, target: FinishedStatus, token: string, timestamp: number, fetchNext?: boolean): string[];
    moveToWaitingChildrenProArgs(jobId: string, token: string, gid: number | string, opts?: MoveToWaitingChildrenOpts): (string | number)[];
    /**
     * Move parent job to waiting-children state.
     *
     * @returns true if job is successfully moved, false if there are pending dependencies.
     * @throws JobNotExist
     * This exception is thrown if jobId is missing.
     * @throws JobLockNotExist
     * This exception is thrown if job lock is missing.
     * @throws JobNotInState
     * This exception is thrown if job is not in active state.
     */
    moveToWaitingChildrenPro(jobId: string, token: string, gid: number | string, opts?: MoveToWaitingChildrenOpts): Promise<boolean>;
    getGroups(start?: number, end?: number): Promise<[
        string[] | undefined,
        string[] | undefined,
        string[] | undefined,
        string[] | undefined,
        number
    ]>;
    private groupStatus2Key;
    getGroupsByStatus(status: GroupStatus, start?: number, end?: number): Promise<[string[], number[]]>;
    getState(jobId: string): Promise<JobState | 'unknown'>;
    pauseGroup(groupId: string | number, pause: boolean): Promise<boolean>;
    /**
     * Rate limit a group.
     *
     * @param jobId - the job id that cased this group to be rate limited
     * @param groupId - the group id
     * @param expirationTimeMs - the expiration time in milliseconds
     * @returns
     */
    rateLimitGroup(jobId: string, groupId: string, expirationTimeMs: number): Promise<void>;
    /**
     * Repairs a maxed group.
     *
     * It seems that in some unknown situations a group can become maxed although there
     * are no active jobs in the group. This function will try to repair this situation.
     *
     * @param groupId
     * @returns
     */
    repairMaxedGroup(groupId: string): Promise<any>;
}
