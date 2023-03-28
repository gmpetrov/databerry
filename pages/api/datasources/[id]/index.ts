import { NextApiResponse } from 'next';

import { AppNextApiRequest } from '@app/types/index';
import { createAuthApiHandler, respond } from '@app/utils/createa-api-handler';
import prisma, {
  datasourceSelect,
  datastoreSelect,
} from '@app/utils/prisma-client';
import triggerTaskRemoveDatasource from '@app/utils/trigger-task-remove-datasource';

const handler = createAuthApiHandler();

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
    select: {
      ...datasourceSelect,
      datastore: {
        select: datastoreSelect,
      },
    },
  });

  if (datasource?.ownerId !== session?.user?.id) {
    return res.status(403).json({ error: 'Unauthorized' });
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
    select: {
      ...datasourceSelect,
      owner: true,
      datastore: {
        select: datastoreSelect,
      },
    },
  });

  if (datasource?.owner?.id !== session?.user?.id) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  const deleted = await prisma.appDatasource.delete({
    where: {
      id,
    },
    select: {
      ...datasourceSelect,
      datastore: {
        select: datastoreSelect,
      },
    },
  });

  triggerTaskRemoveDatasource(deleted.datastore?.id!, id);

  return deleted;
};

handler.delete(respond(deleteDatasource));

export default handler;
