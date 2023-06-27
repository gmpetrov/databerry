import { MessageFrom, SubscriptionPlan, Usage } from '@prisma/client';
import Cors from 'cors';
import { NextApiRequest, NextApiResponse } from 'next';

import { ChatRequest } from '@app/types/dtos';
import { AppNextApiRequest } from '@app/types/index';
import accountConfig from '@app/utils/account-config';
import AgentManager from '@app/utils/agent';
import { ApiError, ApiErrorType } from '@app/utils/api-error';
import ConversationManager from '@app/utils/conversation';
import { createApiHandler, respond } from '@app/utils/createa-api-handler';
import guardAgentQueryUsage from '@app/utils/guard-agent-query-usage';
import prisma from '@app/utils/prisma-client';
import runMiddleware from '@app/utils/run-middleware';
import { validate } from '@app/utils/validate';

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
          usage: true,
          apiKeys: true,
          subscriptions: {
            where: {
              status: 'active',
            },
          },
        },
      },
      tools: {
        include: {
          datastore: true,
        },
      },
      conversations: {
        where: {
          agentId: agentId,
          visitorId: data.visitorId || 'UNKNOWN',
        },
        take: 1,
        include: {
          messages: {
            take: -4,
            orderBy: {
              createdAt: 'asc',
            },
          },
        },
      },
    },
  });

  if (!agent) {
    throw new ApiError(ApiErrorType.INVALID_REQUEST);
  }

  console.log('HEADERS', req.headers);

  // try {
  //   origin = new URL(req.headers['origin'] as string).host;
  // } catch (err) {
  //   console.log('err', req.headers['origin'], err);
  // }
  // guardExternalAgent({
  //   agent: agent as any,
  //   apiKey: apiKey,
  //   hostname: origin,
  // });

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

  if (data.streaming) {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    });
  }

  const streamData = (data: string) => {
    const input = data === '[DONE]' ? data : encodeURIComponent(data);
    res.write(`data: ${input}\n\n`);
  };

  const conversationId = agent?.conversations?.[0]?.id;

  const conversationManager = new ConversationManager({
    agentId,
    conversationId,
    channel: data.channel,
    visitorId: data.visitorId,
    metadata: {
      referer: req.headers.referer as string,
    },
  });

  conversationManager.push({
    text: data.query,
    from: MessageFrom.human,
  });

  const manager = new AgentManager({ agent, topK: 5 });

  const [answer] = await Promise.all([
    manager.query({
      input: data.query,
      stream: data.streaming ? streamData : undefined,
      history: agent?.conversations?.[0]?.messages?.map((each) => ({
        from: each.from,
        message: each.text,
      })),
    }),
    prisma.usage.update({
      where: {
        id: agent?.owner?.usage?.id,
      },
      data: {
        nbAgentQueries: (agent?.owner?.usage?.nbAgentQueries || 0) + 1,
      },
    }),
  ]);

  conversationManager.push({
    text: answer,
    from: MessageFrom.agent,
  });

  conversationManager.save();

  if (data.streaming) {
    streamData('[DONE]');
  } else {
    return {
      answer,
    };
  }
};

handler.post(
  validate({
    body: ChatRequest,
    handler: respond(queryAgent),
  })
);

export default async function wrapper(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await runMiddleware(req, res, cors);

  return handler(req, res);
}
