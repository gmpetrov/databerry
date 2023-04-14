import { DatasourceStatus } from '@prisma/client';
import Queue from 'bull';

import { TaskQueue } from '@app/types';
import { TaskLoadDatasourceRequestSchema } from '@app/types/dtos';
import prisma from '@app/utils/prisma-client';
import taskLoadDatasource from '@app/utils/task-load-datasource';

const datasourceLoadQueue = new Queue(
  TaskQueue.load_datasource,
  process.env.REDIS_URL!,
  {
    redis: {
      tls: process.env.REDIS_URL?.includes('rediss') ? {} : undefined,
    },
  }
);

datasourceLoadQueue.process(async (job, done) => {
  const data = job?.data as TaskLoadDatasourceRequestSchema;
  try {
    console.log('JOB', data);

    taskLoadDatasource(data);

    done();
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
});

export default datasourceLoadQueue;
