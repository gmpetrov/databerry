import Cors from 'cors';
import cuid from 'cuid';
import mime from 'mime-types';
import multer from 'multer';
import { NextApiResponse } from 'next';
import { Readable } from 'node:stream';
import { z } from 'zod';

import { ApiError, ApiErrorType } from '@chaindesk/lib/api-error';
import { s3 } from '@chaindesk/lib/aws';
import {
  createAuthApiHandler,
  respond,
} from '@chaindesk/lib/createa-api-handler';
import { DatastoreManager } from '@chaindesk/lib/datastores';
import generateFunId from '@chaindesk/lib/generate-fun-id';
import getS3RootDomain from '@chaindesk/lib/get-s3-root-domain';
import guardDataProcessingUsage from '@chaindesk/lib/guard-data-processing-usage';
import runMiddleware from '@chaindesk/lib/run-middleware';
import triggerTaskLoadDatasource from '@chaindesk/lib/trigger-task-load-datasource';
import { AcceptedDatasourceMimeTypes } from '@chaindesk/lib/types/dtos';
import { AppNextApiRequest } from '@chaindesk/lib/types/index';
import { UpsertDatasourceSchema } from '@chaindesk/lib/types/models';
import validate from '@chaindesk/lib/validate';
import { DatasourceStatus, DatasourceType, Usage } from '@chaindesk/prisma';
import { prisma } from '@chaindesk/prisma/client';

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
      organizationId: session?.organization?.id,
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
    } catch (err) {
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
  } catch (err) {
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
      organization: {
        include: {
          usage: true,
        },
      },
    },
  });

  if (datastore?.organizationId !== session?.organization?.id) {
    throw new ApiError(ApiErrorType.UNAUTHORIZED);
  }

  guardDataProcessingUsage({
    usage: datastore?.organization?.usage as Usage,
    plan: session?.organization?.currentPlan,
  });

  let existingDatasource;
  if (data?.id) {
    existingDatasource = await prisma.appDatasource.findUnique({
      where: {
        id: data.id,
      },
      include: {
        datastore: true,
      },
    });

    if (
      existingDatasource &&
      (existingDatasource as any)?.organizationId !== session?.organization?.id
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

    if (provider?.organizationId !== session?.organization?.id) {
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

  if (existingDatasource?.id && existingDatasource?.name !== data?.name) {
    // Update metadata here as data loaders will not update chunks if the hash is the same
    await new DatastoreManager(
      existingDatasource?.datastore!
    ).updateDatasourceMetadata({
      datasourceId: existingDatasource?.id,
      metadata: {
        datasource_name: data?.name!,
      },
    });
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
      organization: {
        connect: {
          id: session?.organization?.id,
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
      organizationId: session?.organization?.id,
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
