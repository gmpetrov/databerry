import {
  DatasourceStatus,
  DatasourceType,
  DatastoreVisibility,
} from '@prisma/client';
import cuid from 'cuid';
import { NextApiResponse } from 'next';

import { UpsertRequestSchema } from '@app/types/dtos';
import { UpsertResponseSchema } from '@app/types/dtos';
import { AppNextApiRequest } from '@app/types/index';
import { createApiHandler, respond } from '@app/utils/createa-api-handler';
import generateFunId from '@app/utils/generate-fun-id';
import getSubdomain from '@app/utils/get-subdomain';
import prisma from '@app/utils/prisma-client';
import triggerTaskLoadDatasource from '@app/utils/trigger-task-load-datasource';
import validate from '@app/utils/validate';

const handler = createApiHandler();

export const upsert = async (req: AppNextApiRequest, res: NextApiResponse) => {
  const host = req?.headers?.['host'];
  const subdomain = getSubdomain(host!);
  const data = req.body as UpsertRequestSchema;

  // get Bearer token from header
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')?.[1];

  if (!subdomain) {
    return res.status(400).send('Missing subdomain');
  }

  const datastore = await prisma.datastore.findUnique({
    where: {
      id: subdomain,
    },
    include: {
      apiKeys: true,
    },
  });

  if (!datastore) {
    // return res.status(404).send('Not found');
    throw new Error('Not found');
  }

  if (
    datastore.visibility === DatastoreVisibility.private &&
    (!token || !datastore.apiKeys.find((each) => each.key === token))
  ) {
    // return res.status(403).send('Unauthorized');
    throw new Error('Unauthorized');
  }

  const ids = data.documents.map(() => cuid());

  await prisma.appDatasource.createMany({
    data: data.documents.map((each, index) => ({
      id: ids[index],
      type: DatasourceType.text,
      name: each.name || generateFunId(),
      datastoreId: datastore.id,
      status: DatasourceStatus.pending,
      ownerId: datastore.ownerId,
      config: {
        ...each.metadata,
      },
    })),
  });

  const promises = data.documents.map((each, index) => {
    return new Promise(async (resolve, reject) => {
      try {
        await triggerTaskLoadDatasource(ids[index], each.text);
      } catch (err) {
        console.log('ERROR TRIGGERING TASK', err);

        await prisma.appDatasource.update({
          where: {
            id: ids[index],
          },
          data: {
            status: DatasourceStatus.error,
          },
        });
      } finally {
        resolve(ids[index]);
      }
    });
  });

  // TODO REMOVE WHEN WILL SWITCH TO TASK QUEUES
  await Promise.all(promises);

  return {
    ids,
  } as UpsertResponseSchema;
};

handler.post(
  validate({
    body: UpsertRequestSchema,
    handler: respond(upsert),
  })
);

export default handler;
