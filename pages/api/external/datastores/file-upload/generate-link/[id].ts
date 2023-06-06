import {
  DatasourceStatus,
  DatasourceType,
  DatastoreVisibility,
  SubscriptionPlan,
  Usage,
} from '@prisma/client';
import Cors from 'cors';
import cuid from 'cuid';
import mime from 'mime-types';
import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';

import { GenerateUploadLinkRequest } from '@app/types/dtos';
import { AppNextApiRequest } from '@app/types/index';
import { ApiError, ApiErrorType } from '@app/utils/api-error';
import { s3 } from '@app/utils/aws';
import { createApiHandler, respond } from '@app/utils/createa-api-handler';
import generateFunId from '@app/utils/generate-fun-id';
import guardDataProcessingUsage from '@app/utils/guard-data-processing-usage';
import prisma from '@app/utils/prisma-client';
import runMiddleware from '@app/utils/run-middleware';
import validate from '@app/utils/validate';

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
      owner: {
        include: {
          apiKeys: true,
          usage: true,
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

  const id = cuid();
  const fileExt = mime.extension(data.type);
  const fileName = `${id}${fileExt ? `.${fileExt}` : ''}`;

  const param = {
    Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME,
    Key: `datastores/${datastore.id}/${fileName}`,
    Expires: 900,
    ACL: 'public-read',
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
  req: NextApiRequest,
  res: NextApiResponse
) {
  await runMiddleware(req, res, cors);

  return handler(req, res);
}
