import { JobsOptions } from 'bullmq';
/**
 * @see {@link bullmq!JobsOptions | JobsOptions}
 */
export interface JobsProOptions extends JobsOptions {
    /**
     * A queue can be divided into an unlimited amount of groups that can be defined
     * dynamically as jobs are being added to a queue.
     *
     * The group option allows you to specify the unique group Id where the given job will belong to,
     * and processed according to group mechanics.
     *
     * For more information about groups @see https://docs.bullmq.io/bullmq-pro/groups
     */
    group?: {
        id: string;
    };
}
