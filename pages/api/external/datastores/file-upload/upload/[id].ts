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
import triggerTaskLoadDatasource from '@app/utils/trigger-task-load-datasource';
import validate from '@app/utils/validate';

const cors = Cors({
  methods: ['POST', 'HEAD'],
});

const handler = createApiHandler();

const Schema = z.object({
  id: z.string().cuid(),
});

const GenerateLinkSchema = GenerateUploadLinkRequest.extend({
  fileName: z.string().optional().nullable(),
});
  
export const uploadFile = async (
  req: AppNextApiRequest,
  res: NextApiResponse
) => {
  const datastoreId = req.query.id as string;
  const data = req.body as z.infer<typeof GenerateLinkSchema>;

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

  const dataSourceId = cuid();
  const fileExt = mime.extension(data.type);
  const fileName = `${dataSourceId}${fileExt ? `.${fileExt}` : ''}`;

  const param = {
    Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME,
    Key: `datastores/${datastore.id}/${fileName}`,
    Expires: 900,
    ACL: 'public-read',
    ContentType: data.type,
  };

  await s3.getSignedUrlPromise('putObject', param);

  await prisma.appDatasource.create({
    data: {
      id: dataSourceId,
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

  const datasource = await prisma.appDatasource.findUnique({
    where: {
      id: dataSourceId,
    },
    include: {
      datastore: true,
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

  if (!datasource) {
    throw new ApiError(ApiErrorType.NOT_FOUND);
  }

  if (
    datasource?.datastoreId !== datastoreId ||
    (datasource?.datastore?.visibility === DatastoreVisibility.private &&
      (!token ||
        !datasource?.owner?.apiKeys.find((each) => each.key === token)))
  ) {
    throw new ApiError(ApiErrorType.UNAUTHORIZED);
  }

  guardDataProcessingUsage({
    usage: datasource?.owner?.usage as Usage,
    plan:
      datasource?.owner?.subscriptions?.[0]?.plan || SubscriptionPlan.level_0,
  });

  await triggerTaskLoadDatasource([
    {
      userId: datasource.ownerId!,
      datasourceId: dataSourceId,
      priority: 1,
    },
  ]);

  return datasource
};

handler.post(
  validate({
    body: GenerateLinkSchema,
    handler: respond(uploadFile),
  })
);
  
export default async function wrapper(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await runMiddleware(req, res, cors);

  return handler(req, res);
}
  

