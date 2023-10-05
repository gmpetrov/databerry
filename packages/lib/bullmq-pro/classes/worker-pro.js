import { Worker } from 'bullmq';
import { from,isObservable } from 'rxjs';
import { last, switchMap, timeout } from 'rxjs/operators';

import { ScriptsPro } from '../classes/scripts-pro';

import { JobPro } from './job-pro';
import { RedisConnectionPro } from './redis-connection-pro';
/**
 * @see {@link bullmq!Worker | Worker}
 */
export class WorkerPro extends Worker {
    constructor(name, processor, opts) {
        var _a, _b;
        super(name, processor, Object.assign(Object.assign({}, opts), { autorun: false }), RedisConnectionPro);
        if (((_a = opts === null || opts === void 0 ? void 0 : opts.group) === null || _a === void 0 ? void 0 : _a.limit) && ((_b = opts === null || opts === void 0 ? void 0 : opts.group) === null || _b === void 0 ? void 0 : _b.concurrency)) {
            throw new Error('Rate limit and concurrency cannot be used together');
        }
        const ttlType = typeof (opts === null || opts === void 0 ? void 0 : opts.ttl);
        if (opts && ttlType !== 'undefined') {
            const ttlError = new Error('Ttl must be a positive number');
            if (ttlType == 'number' && opts.ttl <= 0) {
                throw ttlError;
            }
            else {
                for (const ttl of Object.values(opts.ttl)) {
                    if (ttl <= 0) {
                        throw ttlError;
                    }
                }
            }
        }
        this.scripts = new ScriptsPro(this);
        if (!opts || typeof opts.autorun === 'undefined' ? true : opts.autorun) {
            this.run().catch(error => this.emit('error', error));
        }
    }
    get Job() {
        return JobPro;
    }
    async callProcessJob(job, token) {
        var _a;
        const result = await this.processFn(job, token);
        if (isObservable(result)) {
            const observable = result;
            const pipe = [
                switchMap((value) => from(this.storeResult(job.id, token, value))),
                last(),
            ];
            if (this.opts.ttl) {
                const ttl = typeof this.opts.ttl === 'number'
                    ? this.opts.ttl
                    : (_a = this.opts) === null || _a === void 0 ? void 0 : _a.ttl[job.name];
                pipe.push(timeout(ttl));
            }
            return (observable.pipe.apply(observable, pipe).toPromise());
        }
        else {
            return result;
        }
    }
    /**
     * Store returnValue.
     *
     * @param jobId - Job identifier.
     * @param token - Token lock.
     * @param returnValue - The jobs success message.
     */
    async storeResult(jobId, token, returnValue) {
        const client = await this.connection.client;
        const result = await client.storeResult([
            this.toKey(jobId),
            this.toKey(`${jobId}:lock`),
            token,
            JSON.stringify(returnValue),
        ]);
        if (result < 0) {
            throw this.scripts.finishedErrors(result, jobId, 'storeResult');
        }
        return returnValue;
    }
    /**
     * Overrides the rate limit so that it becomes active for the given group.
     *
     * @param job - Job currently being processed, and whose group we want to rate limit.
     * @param expireTimeMs - Expire time in ms of this rate limit.
     */
    async rateLimitGroup(job, expireTimeMs) {
        var _a;
        const opts = job.opts;
        const groupId = (_a = opts.group) === null || _a === void 0 ? void 0 : _a.id;
        if (typeof groupId === 'undefined') {
            throw new Error('Job must have a group id');
        }
        if (expireTimeMs <= 0) {
            throw new Error('expireTimeMs must be greater than 0');
        }
        return this.scripts.rateLimitGroup(job.id, groupId, expireTimeMs);
    }
}
WorkerPro.RateLimitError = Worker.RateLimitError;
//# sourceMappingURL=worker-pro.js.map