import Cors from 'cors';
import { NextApiResponse } from 'next';

import { AppNextApiRequest } from '@app/types/index';
import { ApiError, ApiErrorType } from '@app/utils/api-error';
import { deleteFolderFromS3Bucket } from '@app/utils/aws';
import { createAuthApiHandler, respond } from '@app/utils/createa-api-handler';
import { DatastoreManager } from '@app/utils/datastores';
import prisma from '@app/utils/prisma-client';
import runMiddleware from '@app/utils/run-middleware';

const handler = createAuthApiHandler();

const cors = Cors({
  methods: ['GET', 'DELETE', 'HEAD'],
});

export const getDatasource = async (
  req: AppNextApiRequest,
  res: NextApiResponse
) => {
  const session = req.session;
  const id = req.query.id as string;

  const datasource = await prisma.appDatasource.findUnique({
    where: {
      id,
    },
    include: {
      datastore: {
        select: {
          name: true,
        },
      },
    },
  });

  if (datasource?.ownerId !== session?.user?.id) {
    throw new Error('Unauthorized');
  }

  return datasource;
};

handler.get(respond(getDatasource));

export const deleteDatasource = async (
  req: AppNextApiRequest,
  res: NextApiResponse
) => {
  const session = req.session;
  const id = req.query.id as string;

  const datasource = await prisma.appDatasource.findUnique({
    where: {
      id,
    },
    include: {
      owner: true,
      datastore: true,
    },
  });

  if (datasource?.owner?.id !== session?.user?.id) {
    throw new ApiError(ApiErrorType.UNAUTHORIZED);
  }

  await Promise.all([
    prisma.appDatasource.delete({
      where: {
        id,
      },
    }),
    new DatastoreManager(datasource.datastore!).remove(datasource.id),
    deleteFolderFromS3Bucket(
      process.env.NEXT_PUBLIC_S3_BUCKET_NAME!,
      `datastores/${datasource?.datastore?.id!}/${datasource.id}`
    ),
  ]);

  return datasource;
};

handler.delete(respond(deleteDatasource));

export default async function wrapper(
  req: AppNextApiRequest,
  res: NextApiResponse
) {
  await runMiddleware(req, res, cors);

  return handler(req, res);
}
