import { Agent } from '@prisma/client';
import { NextApiResponse } from 'next';

import { AppNextApiRequest } from '@app/types/index';
import { ApiError, ApiErrorType } from '@app/utils/api-error';
import { createApiHandler, respond } from '@app/utils/createa-api-handler';
import prisma from '@app/utils/prisma-client';

const handler = createApiHandler();

export const getAgent = async (
  req: AppNextApiRequest,
  res: NextApiResponse
) => {
  const agentId = req.query.id as string;

  // get Bearer token from header
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')?.[1];

  if (!agentId) {
    throw new ApiError(ApiErrorType.INVALID_REQUEST);
  }

  const agent = await prisma.agent.findUnique({
    where: {
      id: agentId,
    },
    include: {
      owner: {
        include: {
          subscriptions: true,
          usage: true,
          apiKeys: true,
        },
      },
      tools: {
        include: {
          datastore: true,
        },
      },
    },
  });

  if (!agent) {
    throw new ApiError(ApiErrorType.INVALID_REQUEST);
  }

  //   if (
  //     agent?.visibility === DatastoreVisibility.private &&
  //     (!token || !agent?.owner?.apiKeys.find((each) => each.key === token))
  //   ) {
  //     throw new ApiError(ApiErrorType.UNAUTHORIZED);
  //   }

  return {
    ...agent,
    owner: undefined,
  } as Agent;
};

handler.get(respond(getAgent));

export default handler;
