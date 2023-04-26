import { Queue } from 'bullmq';
import Redis from 'ioredis';

import { TaskQueue } from '@app/types';
import { TaskLoadDatasourceRequestSchema } from '@app/types/dtos';

const connection = new Redis(process.env.REDIS_URL!);

const datasourceLoadQueue = new Queue(TaskQueue.load_datasource, {
  connection,
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
        ...(each.priority ? { priority: each.priority } : {}),
      },
    }))
  );
};

export default triggerTaskLoadDatasource;
