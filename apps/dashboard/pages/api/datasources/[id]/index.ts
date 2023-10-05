import Cors from 'cors';
import { NextApiResponse } from 'next';

import { ApiError, ApiErrorType } from '@chaindesk/lib/api-error';
import { deleteFolderFromS3Bucket } from '@chaindesk/lib/aws';
import bulkDeleteDatasources from '@chaindesk/lib/bulk-delete-datasources';
import {
  createAuthApiHandler,
  respond,
} from '@chaindesk/lib/createa-api-handler';
import { DatastoreManager } from '@chaindesk/lib/datastores';
import { DatasourceLoader } from '@chaindesk/lib/loaders';
import refreshStoredTokensUsage from '@chaindesk/lib/refresh-stored-tokens-usage';
import runMiddleware from '@chaindesk/lib/run-middleware';
import { AppNextApiRequest } from '@chaindesk/lib/types/index';
import { prisma } from '@chaindesk/prisma/client';

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
