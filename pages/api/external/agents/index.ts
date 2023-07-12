import { NextApiResponse } from 'next';

import { AppNextApiRequest } from '@app/types/index';
import { ApiError, ApiErrorType } from '@app/utils/api-error';
import { createApiHandler, respond } from '@app/utils/createa-api-handler';
import prisma from '@app/utils/prisma-client';

const handler = createApiHandler();

export const getAgentsAPI = async (
  req: AppNextApiRequest,
  res: NextApiResponse
) => {
  // get Bearer token from header
  const authHeader = req.headers.authorization;
  const apiKey = authHeader && authHeader.split(' ')?.[1];

  if (!apiKey) {
    throw new ApiError(ApiErrorType.INVALID_REQUEST);
  }

  const found = await prisma.userApiKey.findUnique({
    where: {
      key: apiKey,
    },
  });

  if (!found) {
    throw new ApiError(ApiErrorType.UNAUTHORIZED);
  }

  const agents = await prisma.agent.findMany({
    where: {
      owner: {
        id: found.userId,
      },
    },
    include: {
      owner: {
        include: {
          subscriptions: true,
        },
      },
      tools: {
        select: {
          id: true,
          type: true,
          datastoreId: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return agents;
};

handler.get(respond(getAgentsAPI));

export default handler;
