import { NextApiResponse } from 'next';

import { ApiError, ApiErrorType } from '@chaindesk/lib/api-error';
import {
  createAuthApiHandler,
  respond,
} from '@chaindesk/lib/createa-api-handler';
import guardDataProcessingUsage from '@chaindesk/lib/guard-data-processing-usage';
import triggerTaskLoadDatasource from '@chaindesk/lib/trigger-task-load-datasource';
import { AppNextApiRequest } from '@chaindesk/lib/types/index';
import {
  AppDatasource as Datasource,
  DatasourceStatus,
} from '@chaindesk/prisma';
import { prisma } from '@chaindesk/prisma/client';

const handler = createAuthApiHandler();

export const synchDatasource = async (
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
      organization: {
        include: {
          usage: true,
        },
      },
    },
  });

  if (datasource?.organization?.id !== session?.organization?.id) {
    throw new ApiError(ApiErrorType.UNAUTHORIZED);
  }

  guardDataProcessingUsage({
    usage: datasource?.organization?.usage!,
    plan: session?.organization?.currentPlan,
  });

  const updated = await prisma.appDatasource.update({
    where: {
      id,
    },
    data: {
      status: DatasourceStatus.pending,
    },
    include: {
      datastore: true,
    },
  });

  await triggerTaskLoadDatasource([
    {
      organizationId: session?.organization?.id!,
      datasourceId: datasource.id,
      priority: 2,
    },
  ]);

  return updated;
};

handler.post(respond(synchDatasource));

export default handler;
