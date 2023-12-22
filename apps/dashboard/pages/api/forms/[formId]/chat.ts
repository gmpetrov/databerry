import Cors from 'cors';
import cuid from 'cuid';
import { NextApiRequest, NextApiResponse } from 'next';

import { ApiError, ApiErrorType } from '@chaindesk/lib/api-error';
import { BlaBlaForm, BlablaSchema } from '@chaindesk/lib/blablaform';
import ConversationManager from '@chaindesk/lib/conversation';
import { createApiHandler } from '@chaindesk/lib/createa-api-handler';
import runMiddleware from '@chaindesk/lib/run-middleware';
import streamData from '@chaindesk/lib/stream-data';
import { AppNextApiRequest, SSE_EVENT } from '@chaindesk/lib/types';
import { ChatRequest } from '@chaindesk/lib/types/dtos';
import validate from '@chaindesk/lib/validate';
import {
  ConversationChannel,
  FormStatus,
  Message,
  MessageFrom,
} from '@chaindesk/prisma';
import { prisma } from '@chaindesk/prisma/client';

const handler = createApiHandler();

const cors = Cors({
  methods: ['POST', 'HEAD'],
});

const queryForm = async ({
  input,
  formId,
  stream,
  history,
  temperature,
  filters,
  httpResponse,
  abortController,
  useDraftConfig,
}: {
  input: string;
  formId: string;
  stream?: any;
  history?: Message[] | undefined;
  temperature?: ChatRequest['temperature'];
  filters?: ChatRequest['filters'];
  promptType?: ChatRequest['promptType'];
  promptTemplate?: ChatRequest['promptTemplate'];
  httpResponse?: any;
  abortController?: any;
  useDraftConfig?: boolean;
}) => {
  const found = await prisma.form.findUnique({
    where: { id: formId },
    select: {
      publishedConfig: true,
      draftConfig: true,
    },
  });

  if (!found) {
    throw new ApiError(ApiErrorType.NOT_FOUND);
  }

  const config = useDraftConfig ? found?.draftConfig : found?.publishedConfig;

  if (!config) {
    throw new ApiError(ApiErrorType.INVALID_REQUEST);
  }

  const form = new BlaBlaForm({
    modelName: 'gpt-4-1106-preview',
    schema: (config as any)?.schema as BlablaSchema,
    handleLLMNewToken: stream,
    messages: history?.map((each) => ({
      content: each.text,
      role: each.from === MessageFrom.agent ? 'assistant' : 'user',
    })),
  });

  return form.run(input);
};

export const formChat = async (
  req: AppNextApiRequest,
  res: NextApiResponse
) => {
  const formId = req.query.formId as string;
  const data = req.body as ChatRequest;
  const useDraftConfig = req.query.draft === 'true';

  const conversationId = data.conversationId! || cuid();

  const conversation = await prisma.conversation.findUnique({
    where: {
      id: conversationId,
    },
    include: {
      messages: {
        // take: -10,
        orderBy: {
          createdAt: 'asc',
        },
      },
    },
  });

  const ctrl = new AbortController();

  if (data.streaming) {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    });

    req.socket.on('close', function () {
      ctrl.abort();
    });
  }

  const conversationManager = new ConversationManager({
    formId,
    channel: ConversationChannel.dashboard,
    visitorId: data.visitorId!,
    conversationId,
  });

  conversationManager.push({
    from: MessageFrom.human,
    text: data.query,
  });

  const handleStream = (data: string, event: SSE_EVENT) =>
    streamData({
      event: event || SSE_EVENT.answer,
      data,
      res,
    });

  const chatRes = await queryForm({
    input: data.query,
    formId,
    stream: data.streaming ? handleStream : undefined,
    history: conversation?.messages,
    temperature: data.temperature,
    promptTemplate: data.promptTemplate,
    promptType: data.promptType,
    filters: data.filters,
    httpResponse: res,
    abortController: ctrl,
    useDraftConfig,
  });

  const answerMsgId = cuid();

  // conversationManager.formtStatus = chatRes.isValid
  //   ? FormStatus.COMPLETED
  //   : FormStatus.IN_PROGRESS;

  conversationManager.push({
    id: answerMsgId,
    from: MessageFrom.agent,
    text: chatRes.answer as string,
    metadata: chatRes.metadata,
    sources: [],
  });

  const c = await conversationManager.save();

  if (chatRes.isValid && chatRes.values) {
    const submissionId = c?.formSubmission?.id || cuid();

    await prisma.formSubmission.upsert({
      where: {
        id: submissionId,
      },
      create: {
        conversationId: c?.id,
        formId: formId,
        data: chatRes.values,
        status: FormStatus.COMPLETED,
      },
      update: {
        data: chatRes.values,
        status: FormStatus.COMPLETED,
      },
    });
  }

  if (data.streaming) {
    streamData({
      event: SSE_EVENT.endpoint_response,
      data: JSON.stringify({
        messageId: answerMsgId,
        answer: chatRes.answer,
        isValid: chatRes.isValid,
        sources: [],
        conversationId: conversationManager.conversationId,
        visitorId: conversationManager.visitorId,
      }),
      res,
    });

    streamData({
      data: '[DONE]',
      res,
    });
  } else {
    return {
      ...chatRes,
      messageId: answerMsgId,
      conversationId: conversationManager.conversationId,
      visitorId: conversationManager.visitorId,
    };
  }
};

handler.post(
  validate({
    handler: formChat,
    body: ChatRequest,
  })
);

export default async function wrapper(
  req: AppNextApiRequest,
  res: NextApiResponse
) {
  await runMiddleware(req, res, cors);

  return handler(req, res);
}
