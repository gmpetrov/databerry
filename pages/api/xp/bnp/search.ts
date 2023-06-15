import { ConversationChannel, MessageFrom, Usage } from '@prisma/client';
import cuid from 'cuid';
import { NextApiResponse } from 'next';

import { AppNextApiRequest, ChatRequest } from '@app/types';
import accountConfig from '@app/utils/account-config';
import AgentManager from '@app/utils/agent';
import { ApiError, ApiErrorType } from '@app/utils/api-error';
import chat from '@app/utils/chat-v2';
import ConversationManager from '@app/utils/conversation';
import { createAuthApiHandler, respond } from '@app/utils/createa-api-handler';
import guardAgentQueryUsage from '@app/utils/guard-agent-query-usage';
import prisma from '@app/utils/prisma-client';

const handler = createAuthApiHandler();

export const XPBNPQuery = async (
  req: AppNextApiRequest,
  res: NextApiResponse
) => {
  const session = req.session;
  const id = req.query.id as string;
  const data = req.body as {
    datastoreId: string;
    query: string;
    streaming: boolean;
  };

  const receivedDate = new Date();

  //   const agent = await prisma.agent.findUnique({
  //     where: {
  //       id,
  //     },
  //     include: {
  //       owner: {
  //         include: {
  //           usage: true,
  //           conversations: {
  //             where: {
  //               agentId: id,
  //               userId: session?.user?.id,
  //             },
  //             // include: {
  //             //   messages: {
  //             //     take: -20,
  //             //     orderBy: {
  //             //       createdAt: 'asc',
  //             //     },
  //             //   },
  //             // },
  //           },
  //         },
  //       },
  //       tools: {
  //         include: {
  //           datastore: true,
  //         },
  //       },
  //     },
  //   });

  //   const usage = agent?.owner?.usage as Usage;

  //   guardAgentQueryUsage({
  //     usage,
  //     plan: session?.user?.currentPlan,
  //   });

  const datastore = await prisma.datastore.findUnique({
    where: {
      id: data.datastoreId,
    },
    include: {
      messagesBNP: {
        take: -4,
        orderBy: {
          createdAt: 'asc',
        },
      },
    },
  });

  if (datastore?.ownerId !== session?.user?.id) {
    throw new ApiError(ApiErrorType.UNAUTHORIZED);
  }

  //   const manager = new AgentManager({ agent, topK: 3 });

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

  //   const conversationId = agent?.owner?.conversations?.[0]?.id;

  //   const conversationManager = new ConversationManager({
  //     channel: ConversationChannel.dashboard,
  //     agentId: agent?.id,
  //     userId: session?.user?.id,
  //     conversationId,
  //   });

  //   conversationManager.push({
  //     from: MessageFrom.human,
  //     text: data.query,
  //   });

  //   const [answer, conversation] = await Promise.all([
  //     manager.query({
  //       input: data.query,
  //       stream: data.streaming ? streamData : undefined,
  //       // history: agent?.owner?.conversations?.[0]?.messages?.map((m) => ({
  //       //   from: m.from,
  //       //   message: m.text,
  //       // })),
  //     }),
  //     prisma.usage.update({
  //       where: {
  //         id: agent?.owner?.usage?.id,
  //       },
  //       data: {
  //         nbAgentQueries: (agent?.owner?.usage?.nbAgentQueries || 0) + 1,
  //       },
  //     }),
  //   ]);

  const { answer } = await chat({
    prompt:
      "As a customer support agent, please provide a helpful and professional response to the user's question or issue.",
    promptType: 'customer_support',
    datastore: datastore as any,
    query: data.query,
    topK: 3,
    temperature: 0,
    stream: data.streaming ? streamData : undefined,
    history: datastore?.messagesBNP?.map((m) => ({
      from: m.from,
      message: m.text,
    })),
  });

  await prisma.messageBNP.createMany({
    data: [
      {
        datastoreId: datastore?.id,
        text: data.query,
        from: MessageFrom.human,
        createdAt: receivedDate,
      },
      {
        datastoreId: datastore?.id,
        text: answer,
        from: MessageFrom.agent,
      },
    ],
  });

  //   conversationManager.push({
  //     from: MessageFrom.agent,
  //     text: answer,
  //   });

  //   conversationManager.save();

  if (data.streaming) {
    streamData('[DONE]');
  } else {
    return {
      answer,
    };
  }
};

handler.post(respond(XPBNPQuery));

export default handler;
