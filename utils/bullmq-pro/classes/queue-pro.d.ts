import { Queue } from 'bullmq';

import { ScriptsPro } from '../classes/scripts-pro';
import { GroupStatus } from '../enums/group-status';
import { JobsProOptions,QueueProOptions } from '../interfaces';

import { JobPro } from './job-pro';
export declare type BulkJobProOptions = Omit<JobsProOptions, 'repeat'>;
export declare class QueuePro<DataType = any, ReturnType = any, NameType extends string = string> extends Queue<DataType, ReturnType, NameType> {
    protected scripts: ScriptsPro;
    constructor(name: string, opts?: QueueProOptions);
    /**
     * Get library version.
     *
     * @returns the content of the meta.library field.
     */
    getVersion(): Promise<string>;
    /**
     * Adds a Job to the queue.
     *
     * @param name -
     * @param data -
     * @param opts -
     */
    add(name: NameType, data: DataType, opts?: JobsProOptions): Promise<JobPro<DataType, ReturnType, NameType>>;
    /**
     * Adds an array of jobs to the queue. This method may be faster than adding
     * one job at a time in a sequence.
     *
     * @param jobs - The array of jobs to add to the queue. Each job is defined by 3
     * properties, 'name', 'data' and 'opts'. They follow the same signature as 'Queue.add'.
     */
    addBulk(jobs: {
        name: NameType;
        data: DataType;
        opts?: BulkJobProOptions;
    }[]): Promise<JobPro<DataType, ReturnType, NameType>[]>;
    protected get Job(): typeof JobPro;
    /**
     * Get the group ids with jobs current jobs in them.
     *
     * TODO: Support group id filtering.
     */
    getGroups(start?: number, end?: number): Promise<{
        id: string;
        status: GroupStatus;
    }[]>;
    /**
     * Gets all the groups that are in a particular status.
     *
     * @param status - GroupStatus so we can filter by status
     * @param start - start index, used for pagination.
     * @param end - end index, used for pagination.
     * @returns  an array of objects with the group id and status.
     */
    getGroupsByStatus(status: GroupStatus, start?: number, end?: number): Promise<{
        id: string;
        count: number;
    }[]>;
    /**
     * Get the total number of groups with jobs in them.
     *
     */
    getGroupsCount(): Promise<number>;
    /**
     *
     * Get the total number of groups with jobs in them, in their different
     * statuses.
     *
     * @returns {
     *    waiting: number,
     *    limited: number,
     *    maxed: number,
     *    paused: number,
     * }
     *
     */
    getGroupsCountByStatus(): Promise<{
        waiting: number;
        limited: number;
        maxed: number;
        paused: number;
    }>;
    /**
     * Gets the count of all the jobs belonging to any group.
     *
     * @param groupId -
     */
    getGroupsJobsCount(): Promise<number>;
    /**
     * Get the given group status.
     *
     * @param groupId - The group id to get the status for.
     * @returns GroupStatus - The status of the group or null if the group does not exist.
     */
    getGroupStatus(groupId: string): Promise<GroupStatus>;
    /**
     * Get jobs that are part of a given group.
     *
     */
    getGroupJobs(groupId: string | number, start?: number, end?: number): Promise<JobPro<DataType, ReturnType, NameType>[]>;
    /**
     * Gets the count of jobs inside a given group id.
     *
     * @param groupId -
     */
    getGroupJobsCount(groupId: string | number): Promise<number>;
    /**
     * Cleans all the jobs that are part of a group.
     *
     * @param groupId -
     */
    deleteGroup(groupId: string | number): Promise<void>;
    /**
     * Cleans all the groups in this queue
     *
     * @param groupId -
     */
    deleteGroups(): Promise<void>;
    obliterate(opts?: {
        force?: boolean;
        count?: number;
    }): Promise<void>;
    /**
     * Pauses the processing of a specific group globally.
     *
     * Adding jobs requires a LUA script to check first if the paused list exist
     * and in that case it will add it there instead of the wait list or group list.
     */
    pauseGroup(groupId: string | number): Promise<boolean>;
    /**
     * Resumes the processing of a specific group globally.
     *
     * The method reverses the pause operation by resuming the processing of the
     * group.
     *
     * @param groupId the group to resume
     */
    resumeGroup(groupId: string | number): Promise<boolean>;
    /**
     *
     * Repairs a maxed group.
     *
     * It seems that in some unknown situations a group can become maxed although there
     * are no active jobs in the group. This function will try to repair this situation.
     *
     * @param groupId the group to repair
     */
    repairMaxedGroup(groupId: string): Promise<any>;
}
