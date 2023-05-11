import { FlowOpts, FlowProducer, QueueBaseOptions } from 'bullmq';

import { FlowJobPro } from '../interfaces';

import { JobPro } from './job-pro';
export interface JobNodePro {
    job: JobPro;
    children?: JobNodePro[];
}
declare class InterimFlowProducer extends FlowProducer {
    add(flow: FlowJobPro, opts?: FlowOpts): Promise<any>;
}
/**
 * This class allows to add jobs with dependencies between them in such
 * a way that it is possible to build complex flows.
 * Note: A flow is a tree-like structure of jobs that depend on each other.
 * Whenever the children of a given parent are completed, the parent
 * will be processed, being able to access the children's result data.
 * All Jobs can be in different queues, either children or parents,
 */
export declare class FlowProducerPro extends InterimFlowProducer {
    opts: QueueBaseOptions;
    constructor(opts?: QueueBaseOptions);
    protected get Job(): typeof JobPro;
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
    add(flow: FlowJobPro, opts?: FlowOpts): Promise<JobNodePro>;
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
    addBulk(flows: FlowJobPro[]): Promise<JobNodePro[]>;
}
export {};
