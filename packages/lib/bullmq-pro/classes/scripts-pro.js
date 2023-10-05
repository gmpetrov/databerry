import { getParentKey, isRedisVersionLowerThan,raw2NextJobData, Scripts,  } from 'bullmq';
import { Packr } from 'msgpackr';
import { performance } from 'perf_hooks';

import { GroupStatus } from '../enums/group-status';
const baseTimestamp = Date.now() - performance.now();
function getTimestamp() {
    return baseTimestamp + performance.now();
}
const packer = new Packr({
    useRecords: false,
    encodeUndefinedAsNil: true,
});
const pack = packer.pack;
/**
 * Implementation of the Scripts interface.
 * In the future we may refactor the Scripts interface in BullMQ so that extensions
 * can just extend the Scripts implementation and replace by its own commands.
 */
export class ScriptsPro extends Scripts {
    constructor(queue) {
        super(queue);
        this.queue = queue;
    }
    moveToDelayedProArgs(jobId, timestamp, token, gid) {
        var _a;
        const opts = this.queue.opts;
        timestamp = Math.max(0, timestamp !== null && timestamp !== void 0 ? timestamp : 0);
        if (timestamp > 0) {
            timestamp = timestamp * 0x1000 + (+jobId & 0xfff);
        }
        const keys = [
            'wait',
            'active',
            'priority',
            'delayed',
            jobId,
        ].map(name => {
            return this.queue.toKey(name);
        });
        keys.push.apply(keys, [
            this.queue.keys.events,
            this.queue.keys.paused,
            this.queue.keys.meta,
        ]);
        return keys.concat([
            this.queue.keys[''],
            Date.now(),
            JSON.stringify(timestamp),
            jobId,
            token,
            gid,
            (_a = opts.group) === null || _a === void 0 ? void 0 : _a.concurrency,
        ]);
    }
    async moveToDelayedPro(jobId, timestamp, gid, token = '0') {
        const client = await this.queue.client;
        const args = this.moveToDelayedProArgs(jobId, timestamp, token, gid);
        const result = await client.moveToDelayed(args);
        if (result < 0) {
            throw this.finishedErrors(result, jobId, 'moveToDelayed', 'active');
        }
    }
    retryJobProArgs(jobId, lifo, gid, token) {
        var _a;
        const opts = this.queue.opts;
        const keys = ['', 'active', 'wait', 'paused', jobId, 'meta'].map(name => {
            return this.queue.toKey(name);
        });
        keys.push(this.queue.keys.events);
        const pushCmd = (lifo ? 'R' : 'L') + 'PUSH';
        return keys.concat([
            pushCmd,
            jobId,
            token,
            gid,
            (_a = opts.group) === null || _a === void 0 ? void 0 : _a.concurrency,
            Date.now(),
        ]);
    }
    async moveToActive(token, jobId) {
        const client = await this.queue.client;
        const opts = this.queue.opts;
        const queueKeys = this.queue.keys;
        const keys = [
            queueKeys.wait,
            queueKeys.active,
            queueKeys.priority,
            queueKeys.events,
            queueKeys.stalled,
            queueKeys.limiter,
            queueKeys.delayed,
            queueKeys.paused,
            queueKeys.meta,
        ];
        const args = [
            queueKeys[''],
            Date.now(),
            jobId,
            pack({
                token,
                lockDuration: opts.lockDuration,
                limiter: opts.limiter,
                group: opts.group,
            }),
        ];
        const result = await client.moveToActive(keys.concat(args));
        return raw2NextJobData(result);
    }
    async promote(jobId) {
        const client = await this.queue.client;
        const keys = [
            this.queue.keys.delayed,
            this.queue.keys.wait,
            this.queue.keys.paused,
            this.queue.keys.meta,
            this.queue.keys.priority,
            this.queue.keys.events,
        ];
        const args = [this.queue.toKey(''), jobId, Date.now()];
        return client.promote(keys.concat(args));
    }
    async moveToFinished(jobId, args) {
        const client = await this.queue.client;
        const result = await client.moveToFinished(args);
        if (result < 0) {
            throw this.finishedErrors(result, jobId, 'moveToFinished', 'active');
        }
        else {
            if (typeof result !== 'undefined') {
                return raw2NextJobData(result);
            }
        }
    }
    moveToFailedArgs(job, failedReason, removeOnFailed, token, fetchNext = false) {
        const timestamp = Date.now();
        return this.moveToFinishedArgs(job, failedReason, 'failedReason', removeOnFailed, 'failed', token, timestamp, fetchNext);
    }
    moveToFinishedArgs(job, val, propVal, shouldRemove, target, token, timestamp, fetchNext = true) {
        var _a, _b, _c, _d;
        const queueKeys = this.queue.keys;
        const opts = this.queue.opts;
        const workerKeepJobs = target === 'completed' ? opts.removeOnComplete : opts.removeOnFail;
        const metricsKey = this.queue.toKey(`metrics:${target}`);
        const keys = this.moveToFinishedKeys;
        keys[8] = queueKeys[target];
        keys[9] = this.queue.toKey((_a = job.id) !== null && _a !== void 0 ? _a : '');
        keys[11] = metricsKey;
        const keepJobs = this.getKeepJobs(shouldRemove, workerKeepJobs);
        const args = [
            job.id,
            timestamp,
            propVal,
            typeof val === 'undefined' ? 'null' : val,
            target,
            JSON.stringify({ jobId: job.id, val: val }),
            !fetchNext || this.queue.closing ? 0 : 1,
            queueKeys[''],
            pack({
                token,
                keepJobs,
                limiter: opts.limiter,
                lockDuration: opts.lockDuration,
                group: opts.group,
                attempts: job.opts.attempts,
                attemptsMade: job.attemptsMade,
                maxMetricsSize: ((_b = opts.metrics) === null || _b === void 0 ? void 0 : _b.maxDataPoints)
                    ? (_c = opts.metrics) === null || _c === void 0 ? void 0 : _c.maxDataPoints
                    : '',
                fpof: !!((_d = job.opts) === null || _d === void 0 ? void 0 : _d.failParentOnFailure),
            }),
        ];
        return keys.concat(args);
    }
    moveToWaitingChildrenProArgs(jobId, token, gid, opts) {
        var _a;
        const workerOpts = this.queue.opts;
        const timestamp = Date.now();
        const childKey = getParentKey(opts.child);
        const keys = ['', `${jobId}:lock`, 'active', 'waiting-children', jobId].map(name => {
            return this.queue.toKey(name);
        });
        return keys.concat([
            gid,
            token,
            childKey !== null && childKey !== void 0 ? childKey : '',
            JSON.stringify(timestamp),
            jobId,
            (_a = workerOpts.group) === null || _a === void 0 ? void 0 : _a.concurrency,
        ]);
    }
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
    async moveToWaitingChildrenPro(jobId, token, gid, opts = {}) {
        const client = await this.queue.client;
        const args = this.moveToWaitingChildrenProArgs(jobId, token, gid, opts);
        const result = await client.moveToWaitingChildren(args);
        switch (result) {
            case 0:
                return true;
            case 1:
                return false;
            default:
                throw this.finishedErrors(result, jobId, 'moveToWaitingChildren', 'active');
        }
    }
    async getGroups(start = 0, end = -1) {
        const client = await this.queue.client;
        const result = await client.getGroups([
            this.queue.toKey('groups'),
            this.queue.toKey('groups:limit'),
            this.queue.toKey('groups:max'),
            this.queue.toKey('groups:paused'),
            start,
            end,
        ]);
        return result;
    }
    groupStatus2Key(status) {
        switch (status) {
            case GroupStatus.Waiting:
                return this.queue.toKey('groups');
            case GroupStatus.Limited:
                return this.queue.toKey('groups:limit');
            case GroupStatus.Maxed:
                return this.queue.toKey('groups:max');
            case GroupStatus.Paused:
                return this.queue.toKey('groups:paused');
            default:
                throw new Error(`Invalid group status: ${status}`);
        }
    }
    async getGroupsByStatus(status, start = 0, end = -1) {
        const client = await this.queue.client;
        const groupsKey = this.groupStatus2Key(status);
        const prefix = this.queue.toKey('groups');
        return client.getGroupsByKey([groupsKey, prefix, start, end]);
    }
    async getState(jobId) {
        const client = await this.queue.client;
        const keys = [
            'completed',
            'failed',
            'delayed',
            'active',
            'wait',
            'paused',
            'waiting-children',
            '',
        ].map((key) => {
            return this.queue.toKey(key);
        });
        if (isRedisVersionLowerThan(this.queue.redisVersion, '6.0.6')) {
            return client.getState(keys.concat([jobId]));
        }
        return client.getStateV2(keys.concat([jobId]));
    }
    async pauseGroup(groupId, pause) {
        const client = await this.queue.client;
        const keys = [
            '',
            'wait',
            `groups:${groupId}`,
            'groups',
            'groups:paused',
            `groups:${groupId}:limit`,
            'groups:limit',
            'groups-lid',
            'groups:max',
            'events',
        ].map((key) => {
            return this.queue.toKey(key);
        });
        const code = await client.pauseGroup(keys.concat([groupId, pause ? '0' : '1', getTimestamp()]));
        return code === 0;
    }
    /**
     * Rate limit a group.
     *
     * @param jobId - the job id that cased this group to be rate limited
     * @param groupId - the group id
     * @param expirationTimeMs - the expiration time in milliseconds
     * @returns
     */
    async rateLimitGroup(jobId, groupId, expirationTimeMs) {
        const client = await this.queue.client;
        const keys = [
            this.queue.keys.active,
            this.queue.keys.stalled,
            this.queue.toKey(`${jobId}:lock`),
            this.queue.toKey(`groups:${groupId}`),
            this.queue.toKey(`groups:${groupId}:limit`),
            this.queue.toKey(`groups:paused`),
            this.queue.toKey(`groups`),
            this.queue.toKey(`groups:limit`),
            this.queue.toKey(`wait`),
        ];
        return client.rateLimitGroup(keys.concat([
            jobId,
            expirationTimeMs,
            Date.now(),
            groupId,
            this.queue.toKey(''),
        ]));
    }
    /**
     * Repairs a maxed group.
     *
     * It seems that in some unknown situations a group can become maxed although there
     * are no active jobs in the group. This function will try to repair this situation.
     *
     * @param groupId
     * @returns
     */
    async repairMaxedGroup(groupId) {
        const client = await this.queue.client;
        const keys = [
            this.queue.toKey('groups:active:count'),
            this.queue.toKey('groups:max'),
            this.queue.keys.active,
            this.queue.toKey('groups'),
        ];
        return client.repairMaxedGroup(keys.concat([groupId, this.queue.toKey('')]));
    }
}
//# sourceMappingURL=scripts-pro.js.map