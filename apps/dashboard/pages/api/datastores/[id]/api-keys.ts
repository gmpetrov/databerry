import { NextApiResponse } from 'next';

import {
  createAuthApiHandler,
  respond,
} from '@chaindesk/lib/createa-api-handler';
import { AppNextApiRequest } from '@chaindesk/lib/types/index';
import uuidv4 from '@chaindesk/lib/uuidv4';
import { prisma } from '@chaindesk/prisma/client';

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
      datastore: {
        organizationId: session?.organization?.id,
      },
    },
    include: {
      datastore: {
        select: {
          organizationId: true,
        },
      },
    },
  });

  if (apiKeys?.length <= 0) {
    return [];
  }

  if (apiKeys?.[0]?.datastore?.organizationId !== session?.organization?.id) {
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

  if (datastore?.organizationId !== session?.organization?.id) {
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
          organizationId: true,
        },
      },
    },
  });

  if (
    apiKey?.datastoreId !== id ||
    apiKey?.datastore?.organizationId !== session?.organization?.id
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
