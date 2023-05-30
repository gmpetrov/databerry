import { Usage } from '@prisma/client';
import { NextApiResponse } from 'next';

import { AppNextApiRequest, ChatRequest } from '@app/types';
import accountConfig from '@app/utils/account-config';
import AgentManager from '@app/utils/agent';
import { ApiError, ApiErrorType } from '@app/utils/api-error';
import chat from '@app/utils/chat';
import { createAuthApiHandler, respond } from '@app/utils/createa-api-handler';
import guardAgentQueryUsage from '@app/utils/guard-agent-query-usage';
import prisma from '@app/utils/prisma-client';

const handler = createAuthApiHandler();

export const chatAgentRequest = async (
  req: AppNextApiRequest,
  res: NextApiResponse
) => {
  const session = req.session;
  const id = req.query.id as string;
  const data = req.body as ChatRequest;

  const agent = await prisma.agent.findUnique({
    where: {
      id,
    },
    include: {
      owner: {
        include: {
          usage: true,
        },
      },
      tools: {
        include: {
          datastore: true,
        },
      },
    },
  });

  const usage = agent?.owner?.usage as Usage;

  guardAgentQueryUsage({
    usage,
    plan: session?.user?.currentPlan,
  });

  if (agent?.ownerId !== session?.user?.id) {
    throw new ApiError(ApiErrorType.UNAUTHORIZED);
  }

  const manager = new AgentManager({ agent, topK: 3 });

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

  const [answer] = await Promise.all([
    manager.query(data.query, data.streaming ? streamData : undefined),
    prisma.usage.update({
      where: {
        id: agent?.owner?.usage?.id,
      },
      data: {
        nbAgentQueries: (agent?.owner?.usage?.nbAgentQueries || 0) + 1,
      },
    }),
  ]);

  if (data.streaming) {
    streamData('[DONE]');
  } else {
    return {
      answer,
    };
  }
};

handler.post(respond(chatAgentRequest));

export default handler;
