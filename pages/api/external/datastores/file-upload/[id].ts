import {
  DatasourceStatus,
  DatasourceType,
  SubscriptionPlan,
  Usage,
} from '@prisma/client';
import Cors from 'cors';
import mime from 'mime-types';
import multer from 'multer';
import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';

import { AcceptedDatasourceMimeTypes } from '@app/types/dtos';
import { AppNextApiRequest } from '@app/types/index';
import accountConfig from '@app/utils/account-config';
import { ApiError, ApiErrorType } from '@app/utils/api-error';
import { s3 } from '@app/utils/aws';
import { createApiHandler, respond } from '@app/utils/createa-api-handler';
import cuid from '@app/utils/cuid';
import generateFunId from '@app/utils/generate-fun-id';
import getS3RootDomain from '@app/utils/get-s3-root-domain';
import guardDataProcessingUsage from '@app/utils/guard-data-processing-usage';
import prisma from '@app/utils/prisma-client';
import runMiddleware from '@app/utils/run-middleware';
import triggerTaskLoadDatasource from '@app/utils/trigger-task-load-datasource';

const cors = Cors({
  methods: ['POST', 'HEAD'],
});

const handler = createApiHandler();

const FileSchema = z.object({
  mimetype: z.enum([
    ...AcceptedDatasourceMimeTypes,
    'application/octet-stream',
  ]),
  fieldname: z.string(),
  originalname: z.string(),
  encoding: z.string(),
  size: z.number(),
  buffer: z.any(),
});

export const upload = async (req: AppNextApiRequest, res: NextApiResponse) => {
  const file = (req as any).file as z.infer<typeof FileSchema>;
  const fileName = (req as any)?.body?.fileName as string;
  const custom_id = (req as any)?.body?.custom_id as string;

  // Patch for mime_type 'application/octet-stream' as some http clients don't send the correct mime_type (e.g curl with json file)
  if (file?.mimetype === 'application/octet-stream') {
    let type = mime.contentType(file.originalname);

    if (type) {
      type = type.split(';')?.[0];
      file.mimetype = type as any;
    } else {
      file.mimetype = 'octet' as any;
    }
  }

  try {
    await FileSchema.parseAsync(file);
  } catch (err) {
    console.log('Error File Upload', err);
    throw new ApiError(ApiErrorType.INVALID_REQUEST);
  }

  const datastoreId = req.query.id as string;

  // get Bearer token from header
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader?.split(' ')?.[1];

  if (!token) {
    throw new ApiError(ApiErrorType.UNAUTHORIZED);
  }

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

  if (!token || !datastore?.owner?.apiKeys.find((each) => each.key === token)) {
    throw new ApiError(ApiErrorType.UNAUTHORIZED);
  }

  const plan =
    datastore?.owner?.subscriptions?.[0]?.plan || SubscriptionPlan.level_0;

  if (file.size > accountConfig[plan]?.limits?.maxFileSize) {
    throw new ApiError(ApiErrorType.USAGE_LIMIT);
  }

  guardDataProcessingUsage({
    usage: datastore?.owner?.usage as Usage,
    plan,
  });

  const name =
    fileName ||
    file?.originalname ||
    `${generateFunId()}.${mime.extension(file.mimetype)}`;

  const datasourceId = cuid();

  // Add to S3
  const fileExt = mime.extension(file.mimetype);
  const s3FileName = `${datasourceId}${fileExt ? `.${fileExt}` : ''}`;
  const s3Key = `datastores/${datastore.id}/${datasourceId}/${s3FileName}`;
  const sourceUrl = `${getS3RootDomain()}/${s3Key}`;

  const params = {
    Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME!,
    Key: `datastores/${datastore.id}/${datasourceId}/${s3FileName}`,
    Body: file.buffer,
    ContentType: file.mimetype,
    ACL: 'public-read',
  };

  await s3.putObject(params).promise();

  const datasource = await prisma.appDatasource.create({
    data: {
      id: datasourceId,
      name,
      type: DatasourceType.file,
      config: {
        mime_type: file.mimetype,
        source_url: sourceUrl,
        custom_id,
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

  // Trigger processing
  await triggerTaskLoadDatasource([
    {
      userId: datasource.ownerId!,
      datasourceId,
      priority: 1,
    },
  ]);

  return datasource;
};

handler.use(multer().single('file')).post(respond(upload));

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function wrapper(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await runMiddleware(req, res, cors);

  return handler(req, res);
}
