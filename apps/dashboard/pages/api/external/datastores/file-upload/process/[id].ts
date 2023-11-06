import Cors from 'cors';
import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';

import { ApiError, ApiErrorType } from '@chaindesk/lib/api-error';
import { createApiHandler, respond } from '@chaindesk/lib/createa-api-handler';
import guardDataProcessingUsage from '@chaindesk/lib/guard-data-processing-usage';
import runMiddleware from '@chaindesk/lib/run-middleware';
import triggerTaskLoadDatasource from '@chaindesk/lib/trigger-task-load-datasource';
import { AppNextApiRequest } from '@chaindesk/lib/types/index';
import validate from '@chaindesk/lib/validate';
import {
  DatasourceStatus,
  DatasourceType,
  DatastoreVisibility,
  SubscriptionPlan,
  Usage,
} from '@chaindesk/prisma';
import { prisma } from '@chaindesk/prisma/client';

const cors = Cors({
  methods: ['POST', 'HEAD'],
});

const handler = createApiHandler();

const Schema = z.object({
  id: z.string().cuid(),
});

export const processUpload = async (
  req: AppNextApiRequest,
  res: NextApiResponse
) => {
  const datastoreId = req.query.id as string;

  const data = req.body as z.infer<typeof Schema>;
  const datasourceId = data?.id;

  // get Bearer token from header
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')?.[1];

  if (!datastoreId) {
    throw new ApiError(ApiErrorType.INVALID_REQUEST);
  }

  const datasource = await prisma.appDatasource.findUnique({
    where: {
      id: datasourceId,
    },
    include: {
      datastore: true,
      organization: {
        include: {
          usage: true,
          apiKeys: true,
          subscriptions: {
            where: {
              status: {
                in: ['active', 'trialing'],
              },
            },
          },
        },
      },
    },
  });

  if (!datasource) {
    throw new ApiError(ApiErrorType.NOT_FOUND);
  }

  if (
    datasource?.datastoreId !== datastoreId ||
    (datasource?.datastore?.visibility === DatastoreVisibility.private &&
      (!token ||
        !datasource?.organization?.apiKeys.find((each) => each.key === token)))
  ) {
    throw new ApiError(ApiErrorType.UNAUTHORIZED);
  }

  guardDataProcessingUsage({
    usage: datasource?.organization?.usage as Usage,
    plan:
      datasource?.organization?.subscriptions?.[0]?.plan ||
      SubscriptionPlan.level_0,
  });

  await triggerTaskLoadDatasource([
    {
      organizationId: datasource.organizationId!,
      datasourceId,
      priority: 1,
    },
  ]);

  return datasource;
};

handler.post(
  validate({
    body: Schema,
    handler: respond(processUpload),
  })
);

export default async function wrapper(
  req: AppNextApiRequest,
  res: NextApiResponse
) {
  await runMiddleware(req, res, cors);

  return handler(req, res);
}
