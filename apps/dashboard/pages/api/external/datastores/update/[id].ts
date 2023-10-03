import { NextApiResponse } from 'next';

import { ApiError, ApiErrorType } from '@chaindesk/lib/api-error';
import { createApiHandler, respond } from '@chaindesk/lib/createa-api-handler';
import prepareSourceForWorker from '@chaindesk/lib/prepare-source-for-worker';
import triggerTaskLoadDatasource from '@chaindesk/lib/trigger-task-load-datasource';
import { UpdateRequestSchema } from '@chaindesk/lib/types/dtos';
import { UpdateResponseSchema } from '@chaindesk/lib/types/dtos';
import { AppNextApiRequest } from '@chaindesk/lib/types/index';
import validate from '@chaindesk/lib/validate';
import { DatasourceStatus, DatastoreVisibility } from '@chaindesk/prisma';
import { prisma } from '@chaindesk/prisma/client';

const handler = createApiHandler();

export const update = async (req: AppNextApiRequest, res: NextApiResponse) => {
  const datastoreId = req.query.id as string;
  const data = req.body as UpdateRequestSchema;

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
      organization: {
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
        datastore?.organization?.apiKeys.find((each) => each.key === token) ||
        // TODO REMOVE AFTER MIGRATION
        datastore.apiKeys.find((each) => each.key === token)
      ))
  ) {
    throw new ApiError(ApiErrorType.UNAUTHORIZED);
  }

  const datasource = await prisma.appDatasource.findUnique({
    where: {
      id: data.id,
    },
  });

  if (datasource?.datastoreId !== datastore.id) {
    throw new ApiError(ApiErrorType.UNAUTHORIZED);
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
    await triggerTaskLoadDatasource([
      {
        organizationId: datastore.organizationId!,
        datasourceId: data.id,
        isUpdateText: true,
        priority: 1,
      },
    ]);
  } catch (err) {
    req.logger.error('ERROR TRIGGERING TASK', err);

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
