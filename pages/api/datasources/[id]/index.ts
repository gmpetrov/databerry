import Cors from 'cors';
import { NextApiResponse } from 'next';

import { AppNextApiRequest } from '@app/types/index';
import { ApiError, ApiErrorType } from '@app/utils/api-error';
import { deleteFolderFromS3Bucket } from '@app/utils/aws';
import bulkDeleteDatasources from '@app/utils/bulk-delete-datasources';
import { createAuthApiHandler, respond } from '@app/utils/createa-api-handler';
import { DatastoreManager } from '@app/utils/datastores';
import { DatasourceLoader } from '@app/utils/loaders';
import prisma from '@app/utils/prisma-client';
import refreshStoredTokensUsage from '@app/utils/refresh-stored-tokens-usage';
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

  if (datasource?.organizationId !== session?.organization?.id) {
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
      organization: true,
      datastore: true,
      children: {
        select: {
          id: true,
        },
      },
    },
  });

  if (datasource?.organization?.id !== session?.organization?.id) {
    throw new ApiError(ApiErrorType.UNAUTHORIZED);
  }

  // Delete datasource and all its children (for grouped datasources)
  const ids = [datasource.id, ...datasource.children.map((child) => child.id)];

  await bulkDeleteDatasources({
    datastoreId: datasource.datastoreId!,
    datasourceIds: ids,
  });

  await refreshStoredTokensUsage(datasource.organizationId!);

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
