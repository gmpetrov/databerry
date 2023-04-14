import { DatasourceStatus } from '@prisma/client';
import { Worker } from 'bullmq';
import Redis from 'ioredis';

import { TaskQueue } from '@app/types';
import { TaskLoadDatasourceRequestSchema } from '@app/types/dtos';
import prisma from '@app/utils/prisma-client';
import taskLoadDatasource from '@app/utils/task-load-datasource';

const connection = new Redis(process.env.REDIS_URL!);

const datasourceLoadQueue = new Worker(
  TaskQueue.load_datasource,
  async (job) => {
    const data = job?.data as TaskLoadDatasourceRequestSchema;
    try {
      console.log('JOB', data);

      taskLoadDatasource(data);

      return;
    } catch (err) {
      // TODO: handle error
      console.error(err);

      await prisma.appDatasource.update({
        where: {
          id: data?.datasourceId,
        },
        data: {
          status: DatasourceStatus.error,
        },
      });

      throw err;
    }
  },
  {
    connection,
    concurrency: 5,
  }
);

export default datasourceLoadQueue;
