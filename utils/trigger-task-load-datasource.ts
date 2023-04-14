import { Queue } from 'bullmq';
import Redis from 'ioredis';

import { TaskQueue } from '@app/types';
import { TaskLoadDatasourceRequestSchema } from '@app/types/dtos';

const connection = new Redis(process.env.REDIS_URL!);

const datasourceLoadQueue = new Queue(TaskQueue.load_datasource, {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
  },
});

const triggerTaskLoadDatasource = async (
  datasourceId: string,
  isUpdateText?: boolean
) => {
  return datasourceLoadQueue.add(TaskQueue.load_datasource, {
    datasourceId: datasourceId,
    isUpdateText: isUpdateText,
  } as TaskLoadDatasourceRequestSchema);
};

export default triggerTaskLoadDatasource;
