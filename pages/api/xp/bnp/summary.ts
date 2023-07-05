import { get_encoding } from '@dqbd/tiktoken';
import { ConversationChannel, MessageFrom, Usage } from '@prisma/client';
import cuid from 'cuid';
import { TokenTextSplitter } from 'langchain/text_splitter';
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

const MAX_TOKENS = 12000;

export const XPBNPQuery = async (
  req: AppNextApiRequest,
  res: NextApiResponse
) => {
  const session = req.session;
  const id = req.query.id as string;
  const data = req.body as {
    datastoreId: string;
    userName: string;
    datasourceId: string;
    query: string;
    streaming: boolean;
  };

  const receivedDate = new Date();

  let content = '';
  let nbTokens = 0;

  if (data.datasourceId || data.datastoreId) {
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

    const s3Response = await s3
      .getObject({
        Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME!,
        Key: `datastores/${datastore.id}/${datastore?.datasources?.[0]?.id}/data.json`,
      })
      .promise();

    content = JSON.parse(s3Response.Body?.toString('utf-8') || '{}')
      ?.text as string;

    const encoding = get_encoding('cl100k_base');
    nbTokens = encoding.encode(content).length;
    encoding.free();

    if (nbTokens > MAX_TOKENS) {
      const splitter = new TokenTextSplitter({
        chunkSize: MAX_TOKENS,
        chunkOverlap: 0,
      });

      const chunks = await splitter.splitText(content);
      content = chunks[0];
    }

    console.log('nbTokens ------>', nbTokens);
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

  const { answer } = await chat({
    promptType: 'raw',
    prompt: `${data.query || 'Fait résumé de ce document: '} ${content || ''}`,
    // datastore: datastore as any,
    temperature: 0,
    query: data.query,
    stream: data.streaming ? streamData : undefined,
    modelName: nbTokens > 3200 ? 'gpt-3.5-turbo-16k' : undefined,
  });

  await prisma.messageBNP.createMany({
    data: [
      {
        userName: data.userName,
        text: data.query,
        from: MessageFrom.human,
        createdAt: receivedDate,
      },
      {
        userName: data.userName,
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
