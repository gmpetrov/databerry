// import { Queue } from 'bullmq';
import Redis from 'ioredis';

import { TaskQueue } from '@app/types';
import { TaskLoadDatasourceRequestSchema } from '@app/types/dtos';
import { QueuePro } from '@app/utils/bullmq-pro';

const connection = new Redis(process.env.REDIS_URL!);

const datasourceLoadQueue = new QueuePro(TaskQueue.load_datasource, {
  connection: connection as any,
  defaultJobOptions: {
    attempts: 2,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
  },
});

const triggerTaskLoadDatasource = async (
  data: {
    organizationId: string;
    datasourceId: string;
    isUpdateText?: boolean;
    priority?: number;
  }[]
) => {
  return datasourceLoadQueue.addBulk(
    data.map((each) => ({
      name: TaskQueue.load_datasource,
      data: each as TaskLoadDatasourceRequestSchema,
      opts: {
        group: {
          id: each.organizationId,
        },
        ...(each.priority ? { priority: each.priority } : {}),
      },
    }))
  );
};

export default triggerTaskLoadDatasource;
