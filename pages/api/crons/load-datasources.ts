import { Worker } from "bullmq";
import Redis from "ioredis";
import { NextApiResponse } from "next";

import {
  AppNextApiRequest,
  TaskLoadDatasourceRequestSchema,
  TaskQueue,
} from "@app/types";
import { ApiError, ApiErrorType } from "@app/utils/api-error";
import { createApiHandler, respond } from "@app/utils/createa-api-handler";
import prisma from "@app/utils/prisma-client";
import taskLoadDatasource from "@app/utils/task-load-datasource";
const handler = createApiHandler();
const connection = new Redis(process.env.REDIS_URL!);
import { DatasourceStatus } from "@prisma/client";

export const loadDatasources = async (
  req: AppNextApiRequest,
  res: NextApiResponse
) => {
  const secret = req.query.secret as string;

  if (secret !== process.env.NEXTAUTH_SECRET) {
    throw new ApiError(ApiErrorType.UNAUTHORIZED);
  }
  new Worker(
    TaskQueue.load_datasource,
    async (job) => {
      const data = job?.data as TaskLoadDatasourceRequestSchema;
      try {
        console.log("JOB", data);

        await taskLoadDatasource(data);

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

        throw new Error(JSON.stringify(err));
      }
    },
    {
      connection,
      concurrency: 5,
      removeOnComplete: { count: 1000 },
      removeOnFail: { count: 5000 },
    }
  );
};

handler.get(respond(loadDatasources));
