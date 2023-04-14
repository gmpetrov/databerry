import Queue from 'bull';

import { TaskQueue } from '@app/types';
import { TaskLoadDatasourceRequestSchema } from '@app/types/dtos';

const datasourceLoadQueue = new Queue(
  TaskQueue.load_datasource,
  process.env.REDIS_URL!,
  {
    redis: {
      tls: process.env.REDIS_URL?.includes('rediss') ? {} : undefined,
    },
  }
);

const triggerTaskLoadDatasource = async (
  datasourceId: string,
  isUpdateText?: boolean
) => {
  return datasourceLoadQueue.add({
    datasourceId: datasourceId,
    isUpdateText: isUpdateText,
  } as TaskLoadDatasourceRequestSchema);
};

export default triggerTaskLoadDatasource;
