import { Backoffs,Job,  } from 'bullmq';

import { ScriptsPro } from '../classes/scripts-pro';

import { UnrecoverableError } from './unrecoverable-error';
/**
 * @see {@link bullmq!Job | Job}
 */
export class JobPro extends Job {
    constructor(queue, 
    /**
     * The name of the Job
     */
    name, 
    /**
     * The payload for this job.
     */
    data, 
    /**
     * The options object for this job.
     */
    opts = {}, id) {
        var _a;
        super(queue, name, data, opts, id);
        this.queue = queue;
        this.id = id;
        this.gid = (_a = opts.group) === null || _a === void 0 ? void 0 : _a.id;
        this.scripts = new ScriptsPro(this.queue);
    }
    /**
     * Instantiates a Job from a JobJsonRaw object (coming from a deserialized JSON object)
     *
     * @param queue - the queue where the job belongs to.
     * @param json - the plain object containing the job.
     * @param jobId - an optional job id (overrides the id coming from the JSON object)
     * @returns
     */
    static fromJSON(queue, json, jobId) {
        const job = super.fromJSON(queue, json, jobId);
        job.gid = json.gid;
        return job;
    }
    /**
     * Prepares a job to be passed to Sandbox.
     * @returns
     */
    asJSONSandbox() {
        const json = super.asJSONSandbox();
        return Object.assign(Object.assign({}, json), { gid: this.gid });
    }
    /**
     * Moves a job to the failed queue.
     *
     * @param err - the jobs error message.
     * @param token - token to check job is locked by current worker
     * @param fetchNext - true when wanting to fetch the next job
     * @returns void
     */
    async moveToFailed(err, token, fetchNext = false) {
        const client = await this.queue.client;
        const message = err === null || err === void 0 ? void 0 : err.message;
        const queue = this.queue;
        this.failedReason = message;
        let command;
        const multi = client.multi();
        this.saveStacktraceEx(multi, err);
        //
        // Check if an automatic retry should be performed
        //
        let moveToFailed = false;
        let finishedOn;
        if (this.attemptsMade < this.opts.attempts &&
            !(err instanceof UnrecoverableError || err.name == 'UnrecoverableError') &&
            !this.discarded) {
            const opts = queue.opts;
            // Check if backoff is needed
            const delay = await Backoffs.calculate(this.opts.backoff, this.attemptsMade, err, this, opts.settings && opts.settings.backoffStrategy);
            if (delay === -1) {
                moveToFailed = true;
            }
            else if (delay) {
                const args = this.scripts.moveToDelayedProArgs(this.id, Date.now() + delay, token, this.gid);
                multi.moveToDelayed(args);
                command = 'delayed';
            }
            else {
                // Retry immediately
                multi.retryJob(this.scripts.retryJobProArgs(this.id, this.opts.lifo, this.gid, token));
                command = 'retry';
            }
        }
        else {
            // If not, move to failed
            moveToFailed = true;
        }
        if (moveToFailed) {
            const args = this.scripts.moveToFailedArgs(this, message, this.opts.removeOnFail, token, fetchNext);
            multi.moveToFinished(args);
            command = 'failed';
            finishedOn = args[13];
        }
        const results = (await multi.exec());
        const anyError = results.find(result => result[0]);
        if (anyError) {
            throw new Error(`Error "moveToFailed" with command ${command}: ${anyError}`);
        }
        const code = results[results.length - 1][1];
        if (code < 0) {
            throw this.scripts.finishedErrors(code, this.id, command, 'active');
        }
        if (finishedOn && typeof finishedOn === 'number') {
            this.finishedOn = finishedOn;
        }
    }
    /**
     * Moves the job to the waiting-children set.
     *
     * @param token - Token to check job is locked by current worker
     * @param opts - The options bag for moving a job to waiting-children.
     * @returns true if the job was moved
     */
    moveToWaitingChildren(token, opts = {}) {
        return this.scripts.moveToWaitingChildrenPro(this.id, token, this.gid, opts);
    }
    saveStacktraceEx(multi, err) {
        this.stacktrace = this.stacktrace || [];
        if (err === null || err === void 0 ? void 0 : err.stack) {
            this.stacktrace.push(err.stack);
            if (this.opts.stackTraceLimit) {
                this.stacktrace = this.stacktrace.slice(0, this.opts.stackTraceLimit);
            }
        }
        const params = {
            stacktrace: JSON.stringify(this.stacktrace),
            failedReason: err === null || err === void 0 ? void 0 : err.message,
        };
        multi.hmset(this.queue.toKey(this.id), params);
    }
    /**
     * Moves the job to the delay set.
     *
     * @param timestamp - timestamp where the job should be moved back to "wait"
     * @param token - token to check job is locked by current worker
     * @returns
     */
    moveToDelayed(timestamp, token) {
        return this.scripts.moveToDelayedPro(this.id, timestamp, this.gid, token);
    }
}
//# sourceMappingURL=job-pro.js.map