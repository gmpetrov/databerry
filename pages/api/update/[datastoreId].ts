import { DatasourceStatus, DatastoreVisibility } from '@prisma/client';
import { NextApiResponse } from 'next';

import { UpdateRequestSchema } from '@app/types/dtos';
import { UpdateResponseSchema } from '@app/types/dtos';
import { AppNextApiRequest } from '@app/types/index';
import { s3 } from '@app/utils/aws';
import { createApiHandler, respond } from '@app/utils/createa-api-handler';
import prepareSourceForWorker from '@app/utils/prepare-source-for-worker';
import prisma from '@app/utils/prisma-client';
import triggerTaskLoadDatasource from '@app/utils/trigger-task-load-datasource';
import validate from '@app/utils/validate';

const handler = createApiHandler();

export const update = async (req: AppNextApiRequest, res: NextApiResponse) => {
  const datastoreId = req.query.datastoreId as string;
  const data = req.body as UpdateRequestSchema;

  // get Bearer token from header
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')?.[1];

  if (!datastoreId) {
    return res.status(400).send('Missing subdomain');
  }

  const datastore = await prisma.datastore.findUnique({
    where: {
      id: datastoreId,
    },
    include: {
      apiKeys: true,
    },
  });

  if (!datastore) {
    throw new Error('Not found');
  }

  if (
    datastore.visibility === DatastoreVisibility.private &&
    (!token || !datastore.apiKeys.find((each) => each.key === token))
  ) {
    throw new Error('Unauthorized');
  }

  const datasource = await prisma.appDatasource.findUnique({
    where: {
      id: data.id,
    },
  });

  if (datasource?.datastoreId !== datastore.id) {
    throw new Error('Unauthorized');
  }

  const updated = await prisma.appDatasource.update({
    where: {
      id: data.id,
    },
    data: {
      status: DatasourceStatus.pending,
      config: {
        ...(datasource.config as {}),
        ...data.metadata,
      },
    },
  });

  try {
    await prepareSourceForWorker({
      datasourceId: datasource.id,
      datastoreId: datastore?.id,
      text: data.text,
    });
    await triggerTaskLoadDatasource(data.id, true);
  } catch (err) {
    console.log('ERROR TRIGGERING TASK', err);

    await prisma.appDatasource.update({
      where: {
        id: data.id,
      },
      data: {
        status: DatasourceStatus.error,
      },
    });
  }

  return {
    id: data.id,
  } as UpdateResponseSchema;
};

handler.post(
  validate({
    body: UpdateRequestSchema,
    handler: respond(update),
  })
);

export default handler;
