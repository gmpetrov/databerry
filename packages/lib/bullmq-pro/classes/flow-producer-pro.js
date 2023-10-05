import { FlowProducer, getParentKey } from 'bullmq';

import { JobPro } from './job-pro';
import { RedisConnectionPro } from './redis-connection-pro';
// weaken
// inspired by comment here: https://github.com/microsoft/TypeScript/issues/3402#issuecomment-385975990
class InterimFlowProducer extends FlowProducer {
    async add(flow, opts) {
        return super.add(flow, opts);
    }
}
/**
 * This class allows to add jobs with dependencies between them in such
 * a way that it is possible to build complex flows.
 * Note: A flow is a tree-like structure of jobs that depend on each other.
 * Whenever the children of a given parent are completed, the parent
 * will be processed, being able to access the children's result data.
 * All Jobs can be in different queues, either children or parents,
 */
export class FlowProducerPro extends InterimFlowProducer {
    constructor(opts = {}) {
        super(opts, RedisConnectionPro);
    }
    get Job() {
        return JobPro;
    }
    /**
     * Adds a flow.
     *
     * This call would be atomic, either it fails and no jobs will
     * be added to the queues, or it succeeds and all jobs will be added.
     *
     * @param flow - an object with a tree-like structure where children jobs
     * will be processed before their parents.
     * @param opts - options that will be applied to the flow object.
     */
    async add(flow, opts) {
        var _a;
        if (this.closing) {
            return;
        }
        const client = await this.connection.client;
        const multi = client.multi();
        const parentOpts = (_a = flow === null || flow === void 0 ? void 0 : flow.opts) === null || _a === void 0 ? void 0 : _a.parent;
        const parentKey = getParentKey(parentOpts);
        const parentDependenciesKey = parentKey
            ? `${parentKey}:dependencies`
            : undefined;
        const jobsTree = this.addNode({
            multi,
            node: flow,
            queuesOpts: opts === null || opts === void 0 ? void 0 : opts.queuesOptions,
            parent: {
                parentOpts,
                parentDependenciesKey,
            },
        });
        await multi.exec();
        return jobsTree;
    }
    /**
     * Adds multiple flows.
     *
     * A flow is a tree-like structure of jobs that depend on each other.
     * Whenever the children of a given parent are completed, the parent
     * will be processed, being able to access the children's result data.
     *
     * All Jobs can be in different queues, either children or parents,
     * however this call would be atomic, either it fails and no jobs will
     * be added to the queues, or it succeeds and all jobs will be added.
     *
     * @param flows - an array of objects with a tree-like structure where children jobs
     * will be processed before their parents.
     */
    async addBulk(flows) {
        if (this.closing) {
            return;
        }
        const client = await this.connection.client;
        const multi = client.multi();
        const jobsTrees = this.addNodes(multi, flows);
        await multi.exec();
        return jobsTrees;
    }
}
//# sourceMappingURL=flow-producer-pro.js.map