import { SubscriptionPlan, Usage } from '@prisma/client';
import Cors from 'cors';
import { NextApiRequest, NextApiResponse } from 'next';

import { ChatRequest } from '@app/types/dtos';
import { AppNextApiRequest } from '@app/types/index';
import accountConfig from '@app/utils/account-config';
import AgentManager from '@app/utils/agent';
import { ApiError, ApiErrorType } from '@app/utils/api-error';
import { createApiHandler, respond } from '@app/utils/createa-api-handler';
import guardAgentQueryUsage from '@app/utils/guard-agent-query-usage';
import guardExternalAgent from '@app/utils/guard-external-agent';
import prisma from '@app/utils/prisma-client';
import runMiddleware from '@app/utils/run-middleware';

const handler = createApiHandler();

const cors = Cors({
  methods: ['POST', 'HEAD'],
});

export const queryAgent = async (
  req: AppNextApiRequest,
  res: NextApiResponse
) => {
  const agentId = req.query.id as string;
  const data = req.body as ChatRequest;

  // get Bearer token from header
  const authHeader = req.headers.authorization;
  const apiKey = authHeader && authHeader.split(' ')?.[1];

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

  guardExternalAgent({
    agent: agent as any,
    apiKey: apiKey,
    hostname: new URL(req.headers.origin!).host,
  });

  guardAgentQueryUsage({
    usage: agent?.owner?.usage!,
    plan: agent?.owner?.subscriptions?.[0]?.plan || SubscriptionPlan.level_0,
  });

  const usage = agent?.owner?.usage as Usage;

  if (
    usage?.nbAgentQueries >=
    accountConfig[agent?.owner?.subscriptions?.[0]?.plan!]?.limits
      ?.maxAgentsQueries
  ) {
    throw new ApiError(ApiErrorType.USAGE_LIMIT);
  }

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

export default async function wrapper(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await runMiddleware(req, res, cors);

  return handler(req, res);
}
