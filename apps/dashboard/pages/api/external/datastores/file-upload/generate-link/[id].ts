import Cors from 'cors';
import cuid from 'cuid';
import mime from 'mime-types';
import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';

import { ApiError, ApiErrorType } from '@chaindesk/lib/api-error';
import { s3 } from '@chaindesk/lib/aws';
import { createApiHandler, respond } from '@chaindesk/lib/createa-api-handler';
import generateFunId from '@chaindesk/lib/generate-fun-id';
import guardDataProcessingUsage from '@chaindesk/lib/guard-data-processing-usage';
import runMiddleware from '@chaindesk/lib/run-middleware';
import { GenerateUploadLinkRequest } from '@chaindesk/lib/types/dtos';
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

const Schema = GenerateUploadLinkRequest.extend({
  fileName: z.string().optional().nullable(),
});

export const generateLink = async (
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
      organization: {
        include: {
          apiKeys: true,
          usage: true,
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

  if (!datastore) {
    throw new ApiError(ApiErrorType.NOT_FOUND);
  }

  if (
    datastore.visibility === DatastoreVisibility.private &&
    (!token ||
      !(
        datastore?.organization?.apiKeys.find((each) => each.key === token) ||
        // TODO REMOVE AFTER MIGRATION
        datastore.apiKeys.find((each) => each.key === token)
      ))
  ) {
    throw new ApiError(ApiErrorType.UNAUTHORIZED);
  }

  guardDataProcessingUsage({
    usage: datastore?.organization?.usage as Usage,
    plan:
      datastore?.organization?.subscriptions?.[0]?.plan ||
      SubscriptionPlan.level_0,
  });

  const id = cuid();
  const fileExt = mime.extension(data.type);
  const fileName = `${id}${fileExt ? `.${fileExt}` : ''}`;

  const param = {
    Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME,
    Key: `datastores/${datastore.id}/${fileName}`,
    Expires: 900,
    ContentType: data.type,
  };

  const link = await s3.getSignedUrlPromise('putObject', param);

  await prisma.appDatasource.create({
    data: {
      id,
      type: DatasourceType.file,
      name: data.fileName || generateFunId(),
      config: {
        type: data.type,
      },
      status: DatasourceStatus.pending,
      organization: {
        connect: {
          id: datastore?.organizationId!,
        },
      },
      datastore: {
        connect: {
          id: datastoreId,
        },
      },
    },
  });

  return {
    id,
    link,
  };
};

handler.post(
  validate({
    body: Schema,
    handler: respond(generateLink),
  })
);

export default async function wrapper(
  req: AppNextApiRequest,
  res: NextApiResponse
) {
  await runMiddleware(req, res, cors);

  return handler(req, res);
}
