import { DatasourceStatus, DatasourceType } from '@prisma/client';
import Cors from 'cors';
import { NextApiResponse } from 'next';

import { AppNextApiRequest } from '@app/types/index';
import { ApiError, ApiErrorType } from '@app/utils/api-error';
import { deleteFolderFromS3Bucket } from '@app/utils/aws';
import { createAuthApiHandler, respond } from '@app/utils/createa-api-handler';
import { DatastoreManager } from '@app/utils/datastores';
import prisma from '@app/utils/prisma-client';
import runMiddleware from '@app/utils/run-middleware';

const cors = Cors({
  methods: ['GET', 'DELETE', 'HEAD'],
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

  if (datastore?.ownerId !== session?.user?.id) {
    throw new ApiError(ApiErrorType.UNAUTHORIZED);
  }

  return datastore;
};

handler.get(respond(getDatastore));

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

  if (datastore?.ownerId !== session?.user?.id) {
    throw new ApiError(ApiErrorType.UNAUTHORIZED);
  }

  await Promise.all([
    prisma.datastore.delete({
      where: {
        id,
      },
    }),

    new DatastoreManager(datastore).delete(),

    deleteFolderFromS3Bucket(
      process.env.NEXT_PUBLIC_S3_BUCKET_NAME!,
      `datastores/${datastore.id || 'UNKNOWN'}` // add UNKNOWN to avoid to delete all the folder 😅
    ),
  ]);

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
