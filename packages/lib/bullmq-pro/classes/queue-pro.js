import { Queue } from 'bullmq';

import { ScriptsPro } from '../classes/scripts-pro';
import { GroupStatus } from '../enums/group-status';

import { JobPro } from './job-pro';
import { RedisConnectionPro } from './redis-connection-pro';
const MAX_GROUP_DELETE_ITER = 100;
export class QueuePro extends Queue {
    constructor(name, opts) {
        super(name, opts, RedisConnectionPro);
        this.scripts = new ScriptsPro(this);
        this.waitUntilReady()
            .then(client => {
            if (!this.closing) {
                client.hset(this.keys.meta, 'version', 'bullmq-pro');
            }
        })
            .catch(err => {
            // We ignore this error to avoid warnings. The error can still
            // be received by listening to event 'error'
        });
    }
    /**
     * Get library version.
     *
     * @returns the content of the meta.library field.
     */
    async getVersion() {
        const client = await this.client;
        return await client.hget(this.keys.meta, 'version');
    }
    /**
     * Adds a Job to the queue.
     *
     * @param name -
     * @param data -
     * @param opts -
     */
    add(name, data, opts) {
        return super.add(name, data, opts);
    }
    /**
     * Adds an array of jobs to the queue. This method may be faster than adding
     * one job at a time in a sequence.
     *
     * @param jobs - The array of jobs to add to the queue. Each job is defined by 3
     * properties, 'name', 'data' and 'opts'. They follow the same signature as 'Queue.add'.
     */
    addBulk(jobs) {
        return super.addBulk(jobs);
    }
    get Job() {
        return JobPro;
    }
    /**
     * Get the group ids with jobs current jobs in them.
     *
     * TODO: Support group id filtering.
     */
    async getGroups(start = 0, end = -1) {
        if (end < -1) {
            throw new Error('end must be greater than -1');
        }
        const [groups, rateLimited, maxConcurrencyGroups, pausedGroups] = await this.scripts.getGroups(start, end);
        // Combine results into a single array
        return [
            ...(groups || []).map(group => ({
                id: group,
                status: GroupStatus.Waiting,
            })),
            ...(rateLimited || []).map(group => ({
                id: group,
                status: GroupStatus.Limited,
            })),
            ...(maxConcurrencyGroups || []).map(group => ({
                id: group,
                status: GroupStatus.Maxed,
            })),
            ...(pausedGroups || []).map(group => ({
                id: group,
                status: GroupStatus.Paused,
            })),
        ];
    }
    /**
     * Gets all the groups that are in a particular status.
     *
     * @param status - GroupStatus so we can filter by status
     * @param start - start index, used for pagination.
     * @param end - end index, used for pagination.
     * @returns  an array of objects with the group id and status.
     */
    async getGroupsByStatus(status, start = 0, end = -1) {
        if (end < -1) {
            throw new Error('end must be greater than -1');
        }
        const [groupIds = [], counts = []] = await this.scripts.getGroupsByStatus(status, start, end);
        return groupIds.map((id, index) => ({
            id,
            count: counts[index],
        }));
    }
    /**
     * Get the total number of groups with jobs in them.
     *
     */
    async getGroupsCount() {
        const { waiting, limited, maxed, paused } = await this.getGroupsCountByStatus();
        return waiting + limited + maxed + paused;
    }
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
    async getGroupsCountByStatus() {
        const client = await this.client;
        const multi = client.multi();
        multi.zcard(this.toKey('groups'));
        multi.zcard(this.toKey('groups:limit'));
        multi.zcard(this.toKey('groups:max'));
        multi.zcard(this.toKey('groups:paused'));
        const [[err1, waiting], [err2, limited], [err3, maxed], [err4, paused]] = (await multi.exec());
        const err = [err1, err2, err3, err4].find(err => !!err);
        if (err) {
            throw err;
        }
        return {
            waiting,
            limited,
            maxed,
            paused,
        };
    }
    /**
     * Gets the count of all the jobs belonging to any group.
     *
     * @param groupId -
     */
    async getGroupsJobsCount() {
        const client = await this.client;
        const groupsKey = this.toKey(`groups`);
        let count = 0;
        let start = 0;
        let result;
        const limit = 100;
        do {
            result = await client.getGroupsCount([
                groupsKey,
                this.keys.wait,
                this.toKey(''),
                start,
                start + limit,
            ]);
            if (result) {
                count += result;
                start += limit + 1;
            }
        } while (result);
        return count;
    }
    /**
     * Get the given group status.
     *
     * @param groupId - The group id to get the status for.
     * @returns GroupStatus - The status of the group or null if the group does not exist.
     */
    async getGroupStatus(groupId) {
        const client = await this.client;
        const multi = client.multi();
        multi.zscore(this.toKey('groups'), groupId);
        multi.zscore(this.toKey('groups:limit'), groupId);
        multi.zscore(this.toKey('groups:max'), groupId);
        multi.zscore(this.toKey('groups:paused'), groupId);
        const [[err1, waiting], [err2, limited], [err3, maxed], [err4, paused]] = (await multi.exec());
        if (err1 || err2 || err3 || err4) {
            throw err1 || err2 || err3 || err4;
        }
        if (waiting) {
            return GroupStatus.Waiting;
        }
        if (limited) {
            return GroupStatus.Limited;
        }
        if (maxed) {
            return GroupStatus.Maxed;
        }
        if (paused) {
            return GroupStatus.Paused;
        }
        return null;
    }
    /**
     * Get jobs that are part of a given group.
     *
     */
    async getGroupJobs(groupId, start = 0, end = -1) {
        const client = await this.client;
        const groupKey = this.toKey(`groups:${groupId}`);
        const jobIds = await client.getGroup([
            groupKey,
            this.keys.wait,
            this.toKey(''),
            groupId,
            start,
            end,
        ]);
        return Promise.all(jobIds.map(jobId => JobPro.fromId(this, jobId)));
    }
    /**
     * Gets the count of jobs inside a given group id.
     *
     * @param groupId -
     */
    async getGroupJobsCount(groupId) {
        const client = await this.client;
        const groupKey = this.toKey(`groups:${groupId}`);
        return await client.getGroupCount([
            groupKey,
            this.keys.wait,
            this.toKey(''),
            groupId,
        ]);
    }
    /**
     * Cleans all the jobs that are part of a group.
     *
     * @param groupId -
     */
    async deleteGroup(groupId) {
        const client = await this.client;
        while ((await client.deleteGroup([
            this.toKey(`groups:${groupId}`),
            this.toKey('groups'),
            this.keys.wait,
            this.toKey(''),
            groupId,
            MAX_GROUP_DELETE_ITER,
        ])) > 0) {
            // Empty
        }
    }
    /**
     * Cleans all the groups in this queue
     *
     * @param groupId -
     */
    async deleteGroups() {
        const client = await this.client;
        while (!(await client.deleteGroups([
            this.toKey('groups'),
            this.keys.wait,
            this.toKey(''),
            MAX_GROUP_DELETE_ITER,
        ]))) {
            // Empty
        }
    }
    async obliterate(opts) {
        await this.deleteGroups();
        return super.obliterate(opts);
    }
    /**
     * Pauses the processing of a specific group globally.
     *
     * Adding jobs requires a LUA script to check first if the paused list exist
     * and in that case it will add it there instead of the wait list or group list.
     */
    async pauseGroup(groupId) {
        return this.scripts.pauseGroup(groupId, true);
    }
    /**
     * Resumes the processing of a specific group globally.
     *
     * The method reverses the pause operation by resuming the processing of the
     * group.
     *
     * @param groupId the group to resume
     */
    async resumeGroup(groupId) {
        return this.scripts.pauseGroup(groupId, false);
    }
    /**
     *
     * Repairs a maxed group.
     *
     * It seems that in some unknown situations a group can become maxed although there
     * are no active jobs in the group. This function will try to repair this situation.
     *
     * @param groupId the group to repair
     */
    async repairMaxedGroup(groupId) {
        return this.scripts.repairMaxedGroup(groupId);
    }
}
//# sourceMappingURL=queue-pro.js.map