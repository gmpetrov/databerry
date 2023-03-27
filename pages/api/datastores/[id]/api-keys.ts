import { NextApiResponse } from 'next';

import { AppNextApiRequest } from '@app/types/index';
import { createAuthApiHandler, respond } from '@app/utils/createa-api-handler';
import prisma from '@app/utils/prisma-client';
import uuidv4 from '@app/utils/uuid';

const handler = createAuthApiHandler();

export const getApiKeys = async (
  req: AppNextApiRequest,
  res: NextApiResponse
) => {
  const session = req.session;
  const id = req.query.id as string;

  const apiKeys = await prisma.datastoreApiKey.findMany({
    where: {
      datastoreId: id,
    },
    include: {
      datastore: {
        select: {
          ownerId: true,
        },
      },
    },
  });

  if (apiKeys?.length <= 0) {
    return [];
  }

  if (apiKeys?.[0]?.datastore?.ownerId !== session?.user?.id) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  return apiKeys;
};

handler.get(respond(getApiKeys));

export const createApiKey = async (
  req: AppNextApiRequest,
  res: NextApiResponse
) => {
  const session = req.session;
  const id = req.query.id as string;

  const datastore = await prisma.datastore.findUnique({
    where: {
      id,
    },
  });

  if (datastore?.ownerId !== session?.user?.id) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  const apiKey = await prisma.datastoreApiKey.create({
    data: {
      key: uuidv4(),
      datastore: {
        connect: {
          id,
        },
      },
    },
  });

  return apiKey;
};

handler.post(respond(createApiKey));

export const deleteApiKey = async (
  req: AppNextApiRequest,
  res: NextApiResponse
) => {
  const session = req.session;
  const id = req.query.id as string;
  const apiKeyId = req.body?.apiKeyId as string;

  const apiKey = await prisma.datastoreApiKey.findUnique({
    where: {
      id: apiKeyId,
    },
    include: {
      datastore: {
        select: {
          ownerId: true,
        },
      },
    },
  });

  if (
    apiKey?.datastoreId !== id ||
    apiKey?.datastore?.ownerId !== session?.user?.id
  ) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  const deleted = await prisma.datastoreApiKey.delete({
    where: {
      id: apiKeyId,
    },
  });

  return deleted;
};

handler.delete(respond(deleteApiKey));

export default handler;
