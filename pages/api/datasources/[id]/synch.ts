import { AppDatasource as Datasource, DatasourceStatus } from '@prisma/client';
import { NextApiResponse } from 'next';

import { AppNextApiRequest } from '@app/types/index';
import { createAuthApiHandler, respond } from '@app/utils/createa-api-handler';
import prisma, {
  datasourceSelect,
  datastoreSelect,
} from '@app/utils/prisma-client';
import triggerTaskLoadDatasource from '@app/utils/trigger-task-load-datasource';

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
    select: {
      ...datasourceSelect,
      owner: true,
    },
  });

  if (datasource?.owner?.id !== session?.user?.id) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  const updated = await prisma.appDatasource.update({
    where: {
      id,
    },
    data: {
      status: DatasourceStatus.pending,
    },
    select: {
      ...datasourceSelect,
      datastore: {
        select: datastoreSelect,
      },
    },
  });

  triggerTaskLoadDatasource(datasource?.id!);

  return updated;
};

handler.post(respond(synchDatasource));

export default handler;
