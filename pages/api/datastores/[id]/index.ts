import { NextApiResponse } from 'next';

import { AppNextApiRequest } from '@app/types/index';
import { createAuthApiHandler, respond } from '@app/utils/createa-api-handler';
import { DatastoreManager } from '@app/utils/datastores';
import prisma from '@app/utils/prisma-client';

const handler = createAuthApiHandler();

export const getDatastore = async (
  req: AppNextApiRequest,
  res: NextApiResponse
) => {
  const session = req.session;
  const id = req.query.id as string;

  const datastore = await prisma.datastore.findUnique({
    where: {
      id,
    },
    include: {
      datasources: true,
    },
  });

  if (datastore?.ownerId !== session?.user?.id) {
    throw new Error('Unauthorized');
  }

  return datastore;
};

handler.get(respond(getDatastore));

export const deleteDatastore = async (
  req: AppNextApiRequest,
  res: NextApiResponse
) => {
  const session = req.session;
  const id = req.query.id as string;

  const datastore = await prisma.datastore.findUnique({
    where: {
      id,
    },
    include: {
      datasources: true,
    },
  });

  if (datastore?.ownerId !== session?.user?.id) {
    throw new Error('Unauthorized');
  }

  const deleted = await prisma.datastore.delete({
    where: {
      id,
    },
    include: {
      datasources: true,
    },
  });

  await new DatastoreManager(datastore).delete();

  return deleted;
};

handler.delete(respond(deleteDatastore));

export default handler;
