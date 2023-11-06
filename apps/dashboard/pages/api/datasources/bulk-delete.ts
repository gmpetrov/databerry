import { NextApiResponse } from 'next';
import pMap from 'p-map';
import pRetry from 'p-retry';
import { z } from 'zod';

import { deleteFolderFromS3Bucket } from '@chaindesk/lib/aws';
import bulkDeleteDatasources from '@chaindesk/lib/bulk-delete-datasources';
import {
  createAuthApiHandler,
  respond,
} from '@chaindesk/lib/createa-api-handler';
import { DatastoreManager } from '@chaindesk/lib/datastores';
import { DatasourceLoader } from '@chaindesk/lib/loaders';
import refreshStoredTokensUsage from '@chaindesk/lib/refresh-stored-tokens-usage';
import { AppNextApiRequest } from '@chaindesk/lib/types';
import validate from '@chaindesk/lib/validate';
import { prisma } from '@chaindesk/prisma/client';

const handler = createAuthApiHandler();

export const BulkDeleteDatasourcesSchema = z.object({
  datastoreId: z.string(),
  ids: z.array(z.string()),
});

export type BulkDeleteDatasourcesSchema = z.infer<
  typeof BulkDeleteDatasourcesSchema
>;

export const bulkDelete = async (
  req: AppNextApiRequest,
  res: NextApiResponse
) => {
  const data = req.body as BulkDeleteDatasourcesSchema;
  const session = req.session;

  const datastore = await prisma.datastore.findUnique({
    where: {
      id: data.datastoreId,
    },
  });

  if (datastore?.organizationId !== session?.organization?.id) {
    throw new Error('Unauthorized');
  }

  const datasources = await prisma.appDatasource.findMany({
    where: {
      id: {
        in: data.ids,
      },
    },
    select: {
      id: true,
      organizationId: true,
      datastoreId: true,
      children: {
        select: {
          id: true,
        },
      },
    },
  });

  for (const { id, datastoreId } of datasources) {
    if (datastore.id !== datastoreId) {
      throw new Error('Unauthorized');
    }
  }

  const ids = datasources
    .map((datasource) => [
      datasource.id,
      ...datasource.children.map((child) => child.id),
    ])
    .flat();

  const deleted = await bulkDeleteDatasources({
    datastoreId: datastore.id,
    datasourceIds: ids,
  });

  await refreshStoredTokensUsage(datastore.organizationId!);

  return deleted.count;
};

handler.post(
  validate({
    body: BulkDeleteDatasourcesSchema,
    handler: respond(bulkDelete),
  })
);

export default handler;
