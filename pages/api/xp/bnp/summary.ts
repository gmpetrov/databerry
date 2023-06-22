import { ConversationChannel, MessageFrom, Usage } from '@prisma/client';
import cuid from 'cuid';
import { NextApiResponse } from 'next';

import { AppNextApiRequest, ChatRequest } from '@app/types';
import accountConfig from '@app/utils/account-config';
import AgentManager from '@app/utils/agent';
import { ApiError, ApiErrorType } from '@app/utils/api-error';
import { s3 } from '@app/utils/aws';
import chat from '@app/utils/chat';
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
    datasourceId: string;
    query: string;
    streaming: boolean;
  };

  const receivedDate = new Date();

  if (!data.datasourceId || !data.datastoreId) {
    throw new ApiError(ApiErrorType.INVALID_REQUEST);
  }

  const datastore = await prisma.datastore.findUnique({
    where: {
      id: data.datastoreId,
    },
    include: {
      datasources: {
        where: {
          id: data.datasourceId,
        },
      },
    },
  });

  if (datastore?.ownerId !== session?.user?.id) {
    throw new ApiError(ApiErrorType.UNAUTHORIZED);
  }

  if (!datastore?.datasources?.[0]) {
    throw new ApiError(ApiErrorType.EMPTY_DATASOURCE);
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

  const s3Response = await s3
    .getObject({
      Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME!,
      Key: `datastores/${datastore.id}/${datastore?.datasources?.[0]?.id}/data.json`,
    })
    .promise();

  const content = JSON.parse(s3Response.Body?.toString('utf-8') || '{}')
    ?.text as string;

  console.log('prompt', data.query);
  console.log('content', content);

  const { answer } = await chat({
    promptType: 'raw',
    prompt: `${data.query || 'Fait résumé de ce document: '} ${content}`,
    // datastore: datastore as any,
    temperature: 0,
    query: data.query,
    stream: data.streaming ? streamData : undefined,
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
