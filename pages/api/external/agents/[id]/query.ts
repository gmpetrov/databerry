import { Usage } from '@prisma/client';
import { NextApiResponse } from 'next';

import { ChatRequest } from '@app/types/dtos';
import { AppNextApiRequest } from '@app/types/index';
import accountConfig from '@app/utils/account-config';
import AgentManager from '@app/utils/agent';
import { ApiError, ApiErrorType } from '@app/utils/api-error';
import { createApiHandler, respond } from '@app/utils/createa-api-handler';
import prisma from '@app/utils/prisma-client';
import validate from '@app/utils/validate';

const handler = createApiHandler();

export const queryAgent = async (
  req: AppNextApiRequest,
  res: NextApiResponse
) => {
  const agentId = req.query.id as string;
  const data = req.body as ChatRequest;

  // get Bearer token from header
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')?.[1];

  console.log('DATA', data);
  console.log('DATA =-==================>', data?.query);

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

  const usage = agent?.owner?.usage as Usage;

  //   if (
  //     agent?.visibility === DatastoreVisibility.private &&
  //     (!token || !agent?.owner?.apiKeys.find((each) => each.key === token))
  //   ) {
  //     throw new ApiError(ApiErrorType.UNAUTHORIZED);
  //   }

  if (
    usage?.nbAgentQueries >=
    accountConfig[agent?.owner?.subscriptions?.[0]?.plan!]?.limits
      ?.maxAgentsQueries
  ) {
    throw new ApiError(ApiErrorType.USAGE_LIMIT);
  }

  console.log('agent', agent);

  const manager = new AgentManager({ agent, topK: 3 });

  const [answer] = await Promise.all([
    manager.query(data.query),
    prisma.usage.update({
      where: {
        id: agent?.owner?.usage?.id,
      },
      data: {
        nbAgentQueries: (agent?.owner?.usage?.nbAgentQueries || 0) + 1,
      },
    }),
  ]);

  return {
    answer,
  };
};

handler.post(respond(queryAgent));

export default handler;
