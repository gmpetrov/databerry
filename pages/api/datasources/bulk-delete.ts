import { NextApiResponse } from 'next';
import pMap from 'p-map';
import { z } from 'zod';

import { AppNextApiRequest } from '@app/types';
import { UpsertDatasourceSchema } from '@app/types/models';
import { deleteFolderFromS3Bucket } from '@app/utils/aws';
import { createAuthApiHandler, respond } from '@app/utils/createa-api-handler';
import { DatastoreManager } from '@app/utils/datastores';
import { DatasourceLoader } from '@app/utils/loaders';
import prisma from '@app/utils/prisma-client';
import validate from '@app/utils/validate';

const handler = createAuthApiHandler();

export const BulkDeleteDatasourcesSchema = z.object({
  datastoreId: z.string(),
  ids: z.array(z.string()),
});

export type BulkDeleteDatasourcesSchema = z.infer<
  typeof BulkDeleteDatasourcesSchema
>;

export const bulkDeleteDatasources = async (
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

  if (datastore?.ownerId !== session?.user?.id) {
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
      ownerId: true,
      datastoreId: true,
    },
  });

  for (const { id, datastoreId } of datasources) {
    if (datastore.id !== datastoreId) {
      throw new Error('Unauthorized');
    }
  }

  const deleted = await prisma.appDatasource.deleteMany({
    where: {
      id: {
        in: data.ids,
      },
    },
  });

  await pMap(
    data.ids,
    async (id) => {
      await Promise.all([
        new DatastoreManager(datastore!).remove(id),
        deleteFolderFromS3Bucket(
          process.env.NEXT_PUBLIC_S3_BUCKET_NAME!,
          `datastores/${datastore.id}/${id}`
        ),
      ]);

      return id;
    },
    { concurrency: 5 }
  );

  return deleted.count;
};

handler.post(
  validate({
    body: BulkDeleteDatasourcesSchema,
    handler: respond(bulkDeleteDatasources),
  })
);

export default handler;
