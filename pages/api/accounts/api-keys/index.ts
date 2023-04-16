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

  const apiKeys = await prisma.userApiKey.findMany({
    where: {
      userId: session?.user?.id,
    },
  });

  return apiKeys;
};

handler.get(respond(getApiKeys));

export const createApiKey = async (
  req: AppNextApiRequest,
  res: NextApiResponse
) => {
  const session = req.session;

  const apiKey = await prisma.userApiKey.create({
    data: {
      key: uuidv4(),
      user: {
        connect: {
          id: session?.user?.id,
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
  const apiKeyId = req.body?.apiKeyId as string;

  const apiKey = await prisma.userApiKey.findUnique({
    where: {
      id: apiKeyId,
    },
    include: {
      user: {
        select: {
          apiKeys: {
            select: {
              id: true,
            },
          },
        },
      },
    },
  });

  if (
    apiKey?.userId !== session?.user?.id ||
    apiKey?.user?.apiKeys?.length === 1
  ) {
    // User should always have at least one API key
    throw new Error('Unauthorized');
  }

  const deleted = await prisma.userApiKey.delete({
    where: {
      id: apiKeyId,
    },
  });

  return deleted;
};

handler.delete(respond(deleteApiKey));

export default handler;
