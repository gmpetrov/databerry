import { DatasourceStatus, DatasourceType, Usage } from '@prisma/client';
import Cors from 'cors';
import mime from 'mime-types';
import multer from 'multer';
import { NextApiResponse } from 'next';
import { Readable } from 'node:stream';
import { z } from 'zod';

import { AcceptedDatasourceMimeTypes } from '@app/types/dtos';
import { AppNextApiRequest } from '@app/types/index';
import { UpsertDatasourceSchema } from '@app/types/models';
import { ApiError, ApiErrorType } from '@app/utils/api-error';
import { s3 } from '@app/utils/aws';
import { createAuthApiHandler, respond } from '@app/utils/createa-api-handler';
import cuid from '@app/utils/cuid';
import generateFunId from '@app/utils/generate-fun-id';
import getS3RootDomain from '@app/utils/get-s3-root-domain';
import guardDataProcessingUsage from '@app/utils/guard-data-processing-usage';
import prisma from '@app/utils/prisma-client';
import runMiddleware from '@app/utils/run-middleware';
import triggerTaskLoadDatasource from '@app/utils/trigger-task-load-datasource';
import validate from '@app/utils/validate';

const cors = Cors({
  methods: ['POST', 'HEAD'],
});

const handler = createAuthApiHandler();

async function buffer(readable: Readable) {
  const chunks = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

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

export const getDatasources = async (
  req: AppNextApiRequest,
  res: NextApiResponse
) => {
  const session = req.session;

  const datasources = await prisma.appDatasource.findMany({
    where: {
      ownerId: session?.user?.id,
    },
    orderBy: {
      updatedAt: 'desc',
    },
  });

  return datasources;
};

handler.get(respond(getDatasources));

export const upsertDatasource = async (
  req: AppNextApiRequest,
  res: NextApiResponse
) => {
  const session = req.session;
  const file = (req as any).file as z.infer<typeof FileSchema>;

  let data: UpsertDatasourceSchema;
  let sourceUrl = '';

  if (file) {
    try {
      await FileSchema.parseAsync(file);
    } catch (err: any) {
      throw new ApiError(ApiErrorType.INVALID_REQUEST);
    }

    const formData = req.body as UpsertDatasourceSchema;

    data = {
      // @ts-ignore
      type: DatasourceType.file,
      ...(req.body as UpsertDatasourceSchema),
      name:
        (req.body as any)?.fileName ||
        file?.originalname ||
        `${generateFunId()}.${mime.extension(file.mimetype)}`,
      config: {
        mime_type: file?.mimetype,
        custom_id: req.body?.custom_id,
      },
    };
  } else {
    const buf = await buffer(req);
    const rawBody = buf.toString('utf8');

    data = JSON.parse(rawBody) as UpsertDatasourceSchema;

    if ((data as any)?.custom_id) {
      data.config = {
        ...data?.config,
        custom_id: (data as any)?.custom_id,
      };
    }
  }

  try {
    await UpsertDatasourceSchema.parseAsync(data);
  } catch (err: any) {
    throw new ApiError(ApiErrorType.INVALID_REQUEST);
  }

  if (file && data.type !== DatasourceType.file) {
    throw new ApiError(ApiErrorType.INVALID_REQUEST);
  }

  const datastore = await prisma.datastore.findUnique({
    where: {
      id: data.datastoreId,
    },
    include: {
      owner: {
        include: {
          usage: true,
        },
      },
    },
  });

  if (datastore?.ownerId !== session?.user?.id) {
    throw new ApiError(ApiErrorType.UNAUTHORIZED);
  }

  guardDataProcessingUsage({
    usage: datastore?.owner?.usage as Usage,
    plan: session?.user?.currentPlan,
  });

  let existingDatasource;
  if (data?.id) {
    existingDatasource = await prisma.appDatasource.findUnique({
      where: {
        id: data.id,
      },
    });

    if (
      existingDatasource &&
      (existingDatasource as any)?.ownerId !== session?.user?.id
    ) {
      throw new ApiError(ApiErrorType.UNAUTHORIZED);
    }
  }

  const id = data?.id || cuid();

  let serviceProvider = null;

  if ((data.config as any)?.serviceProviderId) {
    const provider = await prisma.serviceProvider.findUnique({
      where: {
        id: (data.config as any)?.serviceProviderId,
      },
    });

    if (provider?.ownerId !== session?.user?.id) {
      throw new ApiError(ApiErrorType.UNAUTHORIZED);
    }

    serviceProvider = provider;
  }

  if (file) {
    // Add to S3
    const fileExt = mime.extension(file.mimetype);
    const s3FileName = `${id}${fileExt ? `.${fileExt}` : ''}`;
    const s3Key = `datastores/${datastore.id}/${id}/${s3FileName}`;
    sourceUrl = `${getS3RootDomain()}/${s3Key}`;

    const params = {
      Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME!,
      Key: s3Key,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: 'public-read',
    };

    await s3.putObject(params).promise();
  }

  const datasource = await prisma.appDatasource.upsert({
    where: {
      id,
    },
    create: {
      id,
      type: data.type,
      name: data.name || generateFunId(),
      config: {
        ...data.config,
        ...(file
          ? {
              mime_type: file.mimetype,
              source_url: sourceUrl,
            }
          : {}),
      },
      status: DatasourceStatus.pending,
      owner: {
        connect: {
          id: session?.user?.id,
        },
      },
      datastore: {
        connect: {
          id: data.datastoreId,
        },
      },
      ...(serviceProvider
        ? {
            serviceProvider: {
              connect: {
                id: serviceProvider.id,
              },
            },
          }
        : {}),
    },
    update: {
      name: data.name,

      config: {
        ...data.config,
        ...(file
          ? {
              mime_type: file.mimetype,
              source_url: sourceUrl,
            }
          : {}),
      },
    },
  });

  await triggerTaskLoadDatasource([
    {
      userId: session.user.id,
      datasourceId: id,
      isUpdateText: data.isUpdateText,
      priority: 1,
    },
  ]);

  return datasource;
};

handler.use(multer().single('file')).post(
  respond(upsertDatasource)
  // validate({
  //   body: UpsertDatasourceSchema,
  //   handler: respond(upsertDatasource),
  // })
);

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function wrapper(
  req: AppNextApiRequest,
  res: NextApiResponse
) {
  await runMiddleware(req, res, cors);

  return handler(req, res);
}
