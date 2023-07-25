import { ConversationChannel, MessageFrom, Usage } from '@prisma/client';
import cuid from 'cuid';
import { NextApiResponse } from 'next';

import { AppNextApiRequest, ChatRequest, SSE_EVENT } from '@app/types';
import accountConfig, { queryCountConfig } from '@app/utils/account-config';
import AgentManager from '@app/utils/agent';
import { ApiError, ApiErrorType } from '@app/utils/api-error';
import chat from '@app/utils/chat';
import ConversationManager from '@app/utils/conversation';
import { createAuthApiHandler, respond } from '@app/utils/createa-api-handler';
import guardAgentQueryUsage from '@app/utils/guard-agent-query-usage';
import prisma from '@app/utils/prisma-client';
import streamData from '@app/utils/stream-data';

const handler = createAuthApiHandler();

export const chatAgentRequest = async (
  req: AppNextApiRequest,
  res: NextApiResponse
) => {
  const session = req.session;
  const id = req.query.id as string;
  const data = req.body as ChatRequest;

  const conversationId = data.conversationId || cuid();

  const agent = await prisma.agent.findUnique({
    where: {
      id,
    },
    include: {
      owner: {
        include: {
          usage: true,
          conversations: {
            where: {
              id: conversationId,
              agentId: id,
              // userId: session?.user?.id,
            },
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
      },
      tools: {
        include: {
          datastore: true,
        },
      },
    },
  });

  if (agent?.ownerId !== session?.user?.id) {
    throw new ApiError(ApiErrorType.UNAUTHORIZED);
  }

  const usage = agent?.owner?.usage as Usage;

  guardAgentQueryUsage({
    usage,
    plan: session?.user?.currentPlan,
  });

  const manager = new AgentManager({ agent, topK: 5 });

  if (data.streaming) {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    });
  }

  const conversationManager = new ConversationManager({
    channel: ConversationChannel.dashboard,
    agentId: agent?.id,
    userId: session?.user?.id,
    conversationId,
  });

  conversationManager.push({
    from: MessageFrom.human,
    text: data.query,
  });

  const handleStream = (data: string) =>
    streamData({
      data,
      res,
    });

  const [chatRes] = await Promise.all([
    manager.query({
      input: data.query,
      stream: data.streaming ? handleStream : undefined,
      history: agent?.owner?.conversations?.[0]?.messages?.map((m) => ({
        from: m.from,
        message: m.text,
      })),
    }),
    prisma.usage.update({
      where: {
        id: agent?.owner?.usage?.id,
      },
      data: {
        nbAgentQueries:
          (agent?.owner?.usage?.nbAgentQueries || 0) +
          (queryCountConfig?.[agent?.modelName] || 1),
      },
    }),
  ]);

  conversationManager.push({
    from: MessageFrom.agent,
    text: chatRes.answer,
    sources: chatRes.sources,
  });

  conversationManager.save();

  if (data.streaming) {
    streamData({
      event: SSE_EVENT.sources,
      data: JSON.stringify(chatRes.sources),
      res,
    });

    streamData({
      event: SSE_EVENT.chat_config,
      data: JSON.stringify({ conversationId }),
      res,
    });

    streamData({
      data: '[DONE]',
      res,
    });
  } else {
    return {
      ...chatRes,
      conversationId,
    };
  }
};

handler.post(respond(chatAgentRequest));

export default handler;
