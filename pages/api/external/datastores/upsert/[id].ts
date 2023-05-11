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
import { ApiError, ApiErrorType } from '@app/utils/api-error';
import { s3 } from '@app/utils/aws';
import { createApiHandler, respond } from '@app/utils/createa-api-handler';
import generateFunId from '@app/utils/generate-fun-id';
import getSubdomain from '@app/utils/get-subdomain';
import prepareSourceForWorker from '@app/utils/prepare-source-for-worker';
import prisma from '@app/utils/prisma-client';
import triggerTaskLoadDatasource from '@app/utils/trigger-task-load-datasource';
import validate from '@app/utils/validate';

const handler = createApiHandler();

export const upsert = async (req: AppNextApiRequest, res: NextApiResponse) => {
  const datastoreId = req.query.id as string;
  const data = req.body as UpsertRequestSchema;

  // get Bearer token from header
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')?.[1];

  if (!datastoreId) {
    throw new ApiError(ApiErrorType.INVALID_REQUEST);
  }

  const datastore = await prisma.datastore.findUnique({
    where: {
      id: datastoreId,
    },
    include: {
      apiKeys: true,
      owner: {
        include: {
          apiKeys: true,
        },
      },
    },
  });

  if (!datastore) {
    throw new ApiError(ApiErrorType.NOT_FOUND);
  }

  if (
    datastore.visibility === DatastoreVisibility.private &&
    (!token ||
      !(
        datastore?.owner?.apiKeys.find((each) => each.key === token) ||
        // TODO REMOVE AFTER MIGRATION
        datastore.apiKeys.find((each) => each.key === token)
      ))
  ) {
    throw new ApiError(ApiErrorType.UNAUTHORIZED);
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
        await prepareSourceForWorker({
          datasourceId: ids[index],
          datastoreId: datastore?.id,
          text: each.text,
        });
        await triggerTaskLoadDatasource([
          {
            userId: datastore.ownerId!,
            datasourceId: ids[index],
            priority: 1,
          },
        ]);
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
