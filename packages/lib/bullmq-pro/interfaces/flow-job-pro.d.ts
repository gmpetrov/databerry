import { JobsProOptions } from './jobs-pro-options';
interface FlowJobProBase<T> {
    name: string;
    queueName: string;
    data?: any;
    prefix?: string;
    opts?: Omit<T, 'repeat'>;
    children?: FlowChildJobPro[];
}
export declare type FlowChildJobPro = FlowJobProBase<Omit<JobsProOptions, 'parent'>>;
export declare type FlowJobPro = FlowJobProBase<JobsProOptions>;
export {};
