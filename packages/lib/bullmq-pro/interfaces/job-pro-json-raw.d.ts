import { JobJsonRaw } from 'bullmq';
export interface JobProJsonRaw extends JobJsonRaw {
    gid?: string;
}
