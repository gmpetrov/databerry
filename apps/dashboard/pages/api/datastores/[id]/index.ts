import Cors from 'cors';
import { NextApiResponse } from 'next';

import { ApiError, ApiErrorType } from '@chaindesk/lib/api-error';
import { deleteFolderFromS3Bucket } from '@chaindesk/lib/aws';
import {
  createAuthApiHandler,
  respond,
} from '@chaindesk/lib/createa-api-handler';
import { DatastoreManager } from '@chaindesk/lib/datastores';
import refreshStoredTokensUsage from '@chaindesk/lib/refresh-stored-tokens-usage';
import runMiddleware from '@chaindesk/lib/run-middleware';
import { UpdateDatastoreRequestSchema } from '@chaindesk/lib/types/dtos';
import { AppNextApiRequest } from '@chaindesk/lib/types/index';
import validate from '@chaindesk/lib/validate';
import {
  DatasourceStatus,
  DatasourceType,
  DatastoreVisibility,
} from '@chaindesk/prisma';
import { prisma } from '@chaindesk/prisma/client';

const cors = Cors({
  methods: ['GET', 'DELETE', 'PATCH', 'HEAD'],
});

const handler = createAuthApiHandler();

export const getDatastore = async (
  req: AppNextApiRequest,
  res: NextApiResponse
) => {
  const session = req.session;
  const id = req.query.id as string;
  const search = req.query.search as string;
  const status = req.query.status as DatasourceStatus;
  const type = req.query.type as DatasourceType;
  const offset = parseInt((req.query.offset as string) || '0');
  const limit = parseInt((req.query.limit as string) || '100');
  const groupId = (req.query.groupId || null) as string | null;

  const datastore = await prisma.datastore.findUnique({
    where: {
      id,
    },
    include: {
      _count: {
        select: {
          datasources: {
            where: {
              groupId: groupId,
              ...(search
                ? {
                    name: {
                      contains: search,
                    },
                  }
                : {}),
              ...(status
                ? {
                    status,
                  }
                : {}),
              ...(type
                ? {
                    type,
                  }
                : {}),
            },
          },
        },
      },
      datasources: {
        skip: offset * limit,
        take: limit,
        where: {
          groupId,
          ...(search
            ? {
                name: {
                  contains: search,
                },
              }
            : {}),
          ...(status
            ? {
                status,
              }
            : {}),
          ...(type
            ? {
                type,
              }
            : {}),
        },
        orderBy: {
          lastSynch: 'desc',
        },
        include: {
          _count: {
            select: {
              children: true,
            },
          },
          // Trick to know if at least one child is running or pending
          children: {
            where: {
              OR: [
                { status: DatasourceStatus.pending },
                { status: DatasourceStatus.running },
              ],
            },
            select: {
              id: true,
            },
            take: 1,
          },
        },
      },
      apiKeys: true,
    },
  });

  if (datastore?.organizationId !== session?.organization?.id) {
    throw new ApiError(ApiErrorType.UNAUTHORIZED);
  }

  return datastore;
};

handler.get(respond(getDatastore));

export const updateDatastore = async (
  req: AppNextApiRequest,
  res: NextApiResponse
) => {
  const datastoreId = req.query.id as string;
  const data = req.body as UpdateDatastoreRequestSchema;
  const { isPublic, ...updates } = data;
  const session = req.session;
  const datastoreToUpdate = await prisma.datastore.findUnique({
    where: {
      id: datastoreId,
    },
    select: {
      organizationId: true,
    },
  });

  if (!datastoreToUpdate) {
    throw new ApiError(ApiErrorType.NOT_FOUND);
  }

  if (datastoreToUpdate?.organizationId !== session?.organization?.id) {
    throw new ApiError(ApiErrorType.UNAUTHORIZED);
  }
  return prisma.datastore.update({
    where: {
      id: data.id,
    },
    data: {
      ...updates,
      visibility: isPublic
        ? DatastoreVisibility.public
        : DatastoreVisibility.private,
    },
  });
};

handler.patch(
  validate({
    body: UpdateDatastoreRequestSchema,
    handler: respond(updateDatastore),
  })
);

export const deleteDatastore = async (
  req: AppNextApiRequest,
  res: NextApiResponse
) => {
  const session = req.session;
  const id = req.query.id as string;

  const datastore = await prisma.datastore.findUnique({
    where: {
      id,
    },
  });

  if (datastore?.organizationId !== session?.organization?.id) {
    throw new ApiError(ApiErrorType.UNAUTHORIZED);
  }

  await new DatastoreManager(datastore).delete();

  await deleteFolderFromS3Bucket(
    process.env.NEXT_PUBLIC_S3_BUCKET_NAME!,
    `datastores/${datastore.id || 'UNKNOWN'}` // add UNKNOWN to avoid to delete all the folder 😅
  );

  await prisma.datastore.delete({
    where: {
      id,
    },
  });

  await refreshStoredTokensUsage(datastore.organizationId!);

  return datastore;
};

handler.delete(respond(deleteDatastore));

export default async function wrapper(
  req: AppNextApiRequest,
  res: NextApiResponse
) {
  await runMiddleware(req, res, cors);

  return handler(req, res);
}
