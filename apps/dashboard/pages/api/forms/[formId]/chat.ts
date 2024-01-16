import axios from 'axios';
import Cors from 'cors';
import cuid from 'cuid';
import { NextApiRequest, NextApiResponse } from 'next';

import { ApiError, ApiErrorType } from '@chaindesk/lib/api-error';
import { BlaBlaForm, BlablaSchema } from '@chaindesk/lib/blablaform';
import ConversationManager from '@chaindesk/lib/conversation';
import { createApiHandler } from '@chaindesk/lib/createa-api-handler';
import { fetchEventSource } from '@chaindesk/lib/fetch-event-source';
import { handleFormValid } from '@chaindesk/lib/forms';
import getRequestCountry from '@chaindesk/lib/get-request-country';
import partiallyIncludes from '@chaindesk/lib/partially-includes';
import runMiddleware from '@chaindesk/lib/run-middleware';
import streamData from '@chaindesk/lib/stream-data';
import { AppNextApiRequest, SSE_EVENT } from '@chaindesk/lib/types';
import {
  ChatRequest,
  ChatResponse,
  FormConfigSchema,
} from '@chaindesk/lib/types/dtos';
import validate from '@chaindesk/lib/validate';
import {
  AgentModelName,
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

  const ctrl = new AbortController();

  const form = await prisma.form.findUnique({
    where: { id: formId },

    select: {
      publishedConfig: true,
      draftConfig: true,
      agent: {
        include: {
          tools: true,
        },
      },
      organization: {
        include: {
          apiKeys: true,
        },
      },
    },
  });

  if (!form) {
    throw new ApiError(ApiErrorType.NOT_FOUND);
  }

  const config = (
    useDraftConfig ? form?.draftConfig : form?.publishedConfig
  ) as FormConfigSchema;

  const locale = getRequestCountry(req) || 'en';

  const prompt = `You role is to help fill a form that follows a JSON Schema that will be given to you, you should only ask about the field specified in the properties of the schema.
  You will ask questions in natural language, one at a time, to the user and fill the form. Use a friendly and energetic tone. 
  You are able to go back to previous questions if asked.
  Stay consice, avoid long sentences.
  
  Use the language specified by locale = ${locale}. 
  Never request or accept any information beyond what's defined in the schema.

  Always end your question with __BLABLA_FIELD__: name of the field your asking for in order to keep track of the current field, spelled like in the json schema.
  Example with a field named firstname: What is your first name? __BLABLA_FIELD__: firstname
  
  Never fill up the form yourself, always ask the user for the information or use the provided default from values.
  
  Context: ### ${config?.overview || ''} ###
  JSON Schema: ${JSON.stringify(config?.schema, null, 2)}
  `;

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

  const needle = '__BLABLA_FIELD__';

  let buffer = '';
  let stop = false;

  const _handleStream = (data: string, event: SSE_EVENT) =>
    streamData({
      event: event || SSE_EVENT.answer,
      data,
      res,
    });

  const handleStream = (chunk: string, event?: SSE_EVENT) => {
    buffer += chunk;

    if (!stop) {
      if (partiallyIncludes(buffer, needle)) {
        if (buffer.includes(needle)) {
          stop = true;
        }
      } else {
        (_handleStream as any)?.(buffer, event);
        buffer = '';
      }
    }
  };

  let responseBuffer = '';
  let toolBuffer = '';
  let currentField = '';

  let response: ChatResponse | undefined = undefined;
  let tool: any = undefined;

  await fetchEventSource(
    `${process.env.NEXT_PUBLIC_DASHBOARD_URL}/api/agents/${form?.agent?.id}/query`,
    {
      method: 'POST',
      openWhenHidden: true,
      signal: ctrl.signal,
      headers: {
        'Content-Type': 'application/json',

        Authorization: `Bearer ${form?.organization?.apiKeys[0]?.key}`,
      },
      body: JSON.stringify({
        formId,
        channel: ConversationChannel.form,
        conversationId,
        query: data.query,
        systemPrompt: prompt,
        modelName: AgentModelName.gpt_4_turbo,
        streaming: true,
        toolsConfig: {
          [form!.agent!.tools[0].id]: {
            useDraftConfig,
          },
        },
      } as ChatRequest),
      onmessage: (event) => {
        if (event.data === '[DONE]') {
          try {
            ctrl.abort();
            response = JSON.parse(responseBuffer) as ChatResponse;
          } catch (err) {
            console.log(responseBuffer);
          }
        } else {
          if (event.event === SSE_EVENT.answer) {
            handleStream(decodeURIComponent(event.data), event.event as any);
          } else if (event.event === SSE_EVENT.endpoint_response) {
            responseBuffer += decodeURIComponent(event.data);
          } else if (event.event === SSE_EVENT.tool_call) {
            _handleStream(decodeURIComponent(event.data), event.event as any);
            toolBuffer += decodeURIComponent(event.data);
          }
        }
      },
    }
  );

  const re = /__BLABLA_FIELD__:?\s?(.*)/;
  currentField = (response as any)?.answer?.match(re)?.[1]?.trim?.() || '';
  console.log('currentFieldp-------------->', currentField);

  if (!config?.schema?.properties?.[currentField]) {
    currentField = '';
  }

  try {
    if (toolBuffer) {
      tool = JSON.parse(toolBuffer);
    }
  } catch (err) {
    console.log(toolBuffer);
  }

  if ((response as any)?.answer) {
    (response as any).answer = (response as any)?.answer?.replace(re, '');
  }

  const isValid = !!(tool?.name as string)?.startsWith('isFormValid');

  if (currentField || isValid) {
    _handleStream(
      JSON.stringify({ currentField, isValid }),
      SSE_EVENT.metadata
    );
  }

  const messageId = (response as any)?.messageId as string;

  if ((messageId && currentField) || isValid) {
    await prisma.message.update({
      where: {
        id: messageId,
      },
      data: {
        text: (response as any)?.answer,
        metadata: {
          ...(response as any)?.metadata,
          currentField,
          isValid,
        },
      },
    });
  }

  if (response) {
    _handleStream(JSON.stringify(response), SSE_EVENT.endpoint_response);
  }

  streamData({
    data: '[DONE]',
    res,
  });

  return response;

  // const conversation = await prisma.conversation.findUnique({
  //   where: {
  //     id: conversationId,
  //   },
  //   include: {
  //     form: true,
  //     messages: {
  //       take: -100,
  //       orderBy: {
  //         createdAt: 'asc',
  //       },
  //     },
  //   },
  // });

  // const conversationManager = new ConversationManager({
  //   formId,
  //   channel: ConversationChannel.dashboard,
  //   visitorId: data.visitorId!,
  //   conversationId,
  // });

  // conversationManager.push({
  //   from: MessageFrom.human,
  //   text: data.query,
  // });

  // const chatRes = await queryForm({
  //   input: data.query,
  //   formId,
  //   stream: data.streaming ? handleStream : undefined,
  //   history: conversation?.messages,
  //   temperature: data.temperature,
  //   promptTemplate: data.promptTemplate,
  //   promptType: data.promptType,
  //   filters: data.filters,
  //   httpResponse: res,
  //   abortController: ctrl,
  //   useDraftConfig,
  // });

  // const answerMsgId = cuid();

  // // conversationManager.formtStatus = chatRes.isValid
  // //   ? FormStatus.COMPLETED
  // //   : FormStatus.IN_PROGRESS;

  // conversationManager.push({
  //   id: answerMsgId,
  //   from: MessageFrom.agent,
  //   text: chatRes.answer as string,
  //   metadata: chatRes.metadata,
  //   sources: [],
  // });

  // const c = await conversationManager.save();

  // if (chatRes.isValid && chatRes.values) {
  //   const submissionId = c?.formSubmission?.id || cuid();

  //   await handleFormValid({
  //     conversationId: c?.id!,
  //     formId: formId,
  //     values: chatRes.values,
  //     webhookUrl: config?.webhook?.url!,
  //     submissionId,
  //   });
  // }

  // if (data.streaming) {
  //   streamData({
  //     event: SSE_EVENT.endpoint_response,
  //     data: JSON.stringify({
  //       messageId: answerMsgId,
  //       answer: chatRes.answer,
  //       isValid: chatRes.isValid,
  //       sources: [],
  //       conversationId: conversationManager.conversationId,
  //       visitorId: conversationManager.visitorId,
  //     }),
  //     res,
  //   });

  //   streamData({
  //     data: '[DONE]',
  //     res,
  //   });
  // } else {
  //   return {
  //     ...chatRes,
  //     messageId: answerMsgId,
  //     conversationId: conversationManager.conversationId,
  //     visitorId: conversationManager.visitorId,
  //   };
  // }
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
