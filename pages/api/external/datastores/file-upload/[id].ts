import {
  DatasourceStatus,
  DatasourceType,
  DatastoreVisibility,
  SubscriptionPlan,
  Usage,
} from '@prisma/client';
import Cors from 'cors';
import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';

import { AppNextApiRequest } from '@app/types/index';
import { ApiError, ApiErrorType } from '@app/utils/api-error';
import { createApiHandler, respond } from '@app/utils/createa-api-handler';
import generateFunId from '@app/utils/generate-fun-id';
import guardDataProcessingUsage from '@app/utils/guard-data-processing-usage';
import prisma from '@app/utils/prisma-client';
import runMiddleware from '@app/utils/run-middleware';
import triggerTaskLoadDatasource from '@app/utils/trigger-task-load-datasource';
import validate from '@app/utils/validate';

const cors = Cors({
  methods: ['POST', 'HEAD'],
});

const handler = createApiHandler();

const Schema = z.object({
  id: z.string().cuid(),
});

export const fileUpload = async (
  req: AppNextApiRequest,
  res: NextApiResponse
) => {
  const datastoreId = req.query.id as string;
  const data = req.body as z.infer<typeof Schema>;

  // get Bearer token from header
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')?.[1];

  if (!datastoreId) {
    throw new ApiError(ApiErrorType.INVALID_REQUEST);
  }

  const datastore = await prisma.datastore.findUnique({
    where: {
      id: datastoreId,
    },
    include: {
      apiKeys: true,
      owner: {
        include: {
          usage: true,
          apiKeys: true,
          subscriptions: {
            where: {
              status: 'active',
            },
          },
        },
      },
    },
  });

  if (!datastore) {
    throw new ApiError(ApiErrorType.NOT_FOUND);
  }

  if (
    datastore.visibility === DatastoreVisibility.private &&
    (!token ||
      !(
        datastore?.owner?.apiKeys.find((each) => each.key === token) ||
        // TODO REMOVE AFTER MIGRATION
        datastore.apiKeys.find((each) => each.key === token)
      ))
  ) {
    throw new ApiError(ApiErrorType.UNAUTHORIZED);
  }

  guardDataProcessingUsage({
    usage: datastore?.owner?.usage as Usage,
    plan:
      datastore?.owner?.subscriptions?.[0]?.plan || SubscriptionPlan.level_0,
  });

  const id = data?.id;

  const datasource = await prisma.appDatasource.create({
    data: {
      id,
      type: DatasourceType.file,
      name: generateFunId(),
      config: {},
      status: DatasourceStatus.pending,
      owner: {
        connect: {
          id: datastore?.ownerId!,
        },
      },
      datastore: {
        connect: {
          id: datastoreId,
        },
      },
    },
  });

  await triggerTaskLoadDatasource([{ datasourceId: id, priority: 1 }]);

  return datasource;
};

handler.post(
  validate({
    body: Schema,
    handler: respond(fileUpload),
  })
);

export default async function wrapper(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await runMiddleware(req, res, cors);

  return handler(req, res);
}
