import {
  ChatCompletionMessageParam,
  ChatCompletionTool,
} from 'openai/resources';

import { AgentModelName, Message, Tool, ToolType } from '@chaindesk/prisma';

import { handler as datastoreToolHandler } from './agent/tools/datastore';
import {
  createHandler as createFormToolHandler,
  toJsonSchema as formToolToJsonSchema,
} from './agent/tools/form';
import {
  createHandler as createHttpToolHandler,
  toJsonSchema as httpToolToJsonSchema,
} from './agent/tools/http';
import { CreateToolHandler } from './agent/tools/type';
import type { Source } from './types/document';
import {
  ChatModelConfigSchema,
  ChatRequest,
  ChatResponse,
  FormToolSchema,
  HttpToolSchema,
  ToolSchema,
} from './types/dtos';
import ChatModel from './chat-model';
import { ModelConfig } from './config';
import formatMessagesOpenAI from './format-messages-openai';
import getUsageCost from './get-usage-cost';
import promptInject from './prompt-inject';
import truncateChatMessages from './truncateChatMessages';

export type ChatProps = ChatModelConfigSchema & {
  systemPrompt?: string;
  userPrompt?: string;
  query: string;
  stream?: any;
  modelName?: AgentModelName;
  history?: Message[];
  abortController?: AbortController;
  context?: string;
  useXpContext?: boolean;
  tools?: Tool[];
  filters?: ChatRequest['filters'];
  topK?: number;
};

const chat = async ({
  query,
  userPrompt,
  systemPrompt,
  stream,
  temperature,
  history,
  modelName = AgentModelName.gpt_3_5_turbo,
  abortController,
  context,
  tools = [],
  filters,
  topK,
  ...otherProps
}: ChatProps) => {
  // Tools
  const nbDatastoreTools =
    tools?.filter((each) => each.type === 'datastore')?.length || 0;

  const httpTools = (tools as ToolSchema[]).filter(
    (each) => each.type === ToolType.http
  ) as HttpToolSchema[];

  const formTools = (tools as ToolSchema[]).filter(
    (each) => each.type === ToolType.form
  ) as FormToolSchema[];

  const approvals: ChatResponse['approvals'] = [];

  const handleToolWithApproval = async (
    props: ChatResponse['approvals'][0]
  ) => {
    approvals.push(props);

    throw 'ToolApprovalRequired';
  };

  const createHandler =
    (handler: CreateToolHandler) =>
    (tool: ToolSchema) =>
    async (args: unknown) => {
      const res = await handler(tool)(args);

      if (res.approvalRequired) {
        return handleToolWithApproval({
          tool,
          payload: args,
        });
      }

      return res.data;
    };

  const formatedHttpTools = httpTools.map(
    (each) =>
      ({
        type: 'function',

        function: {
          ...httpToolToJsonSchema(each),
          parse: JSON.parse,
          function: createHandler(createHttpToolHandler)(each),
        },
        // } as RunnableToolFunction<HttpToolPayload>)
      } as ChatCompletionTool)
  );

  const formatedFormTools = formTools.map(
    (each) =>
      ({
        type: 'function',

        function: {
          ...formToolToJsonSchema(each),
          parse: JSON.parse,
          function: createHandler(createFormToolHandler)(each),
        },
      } as ChatCompletionTool)
  );

  let retrievalData:
    | Awaited<ReturnType<typeof datastoreToolHandler>>
    | undefined = undefined;

  if (userPrompt?.includes('{context}')) {
    retrievalData = await datastoreToolHandler({
      maxTokens: ModelConfig?.[modelName!]?.maxTokens * 0.2,
      query: query,
      tools: tools,
      filters: filters,
      topK: topK,
      similarityThreshold: 0.7,
    });
  }

  // Messages
  const truncatedHistory = (
    await truncateChatMessages({
      messages: formatMessagesOpenAI(history || []).reverse(),
      maxTokens: ModelConfig[modelName]?.maxTokens * 0.3, // 30% tokens limit for history
    })
  ).reverse();

  const messages: ChatCompletionMessageParam[] = [
    ...(systemPrompt
      ? [
          {
            role: 'system',
            content: systemPrompt,
          } as ChatCompletionMessageParam,
        ]
      : []),
    ...truncatedHistory,
    {
      role: 'user',
      content: promptInject({
        template: userPrompt || '{query}',
        query: query,
        context: retrievalData?.context,
      }),
    },
  ];

  const model = new ChatModel();

  const openAiTools = [
    ...formatedHttpTools,
    ...formatedFormTools,
    ...(nbDatastoreTools > 0
      ? [
          {
            type: 'function',
            function: {
              name: 'queryKnowledgeBase',
              description: 'Use it for any other query',
              parameters: {
                type: 'object',
                properties: {},
              },
              parse: JSON.parse,
              function: async () => {
                if (retrievalData) {
                  return retrievalData.context;
                }

                retrievalData = await datastoreToolHandler({
                  maxTokens: ModelConfig?.[modelName!]?.maxTokens * 0.2,
                  query: query,
                  tools: tools,
                  filters: filters,
                  topK: topK,
                  similarityThreshold: 0.7,
                });
                return retrievalData.context;
              },
            },
          } as ChatCompletionTool,
        ]
      : []),
  ] as ChatCompletionTool[];

  console.log(
    'CHAT V3 PAYLOAD',
    JSON.stringify(
      {
        handleStream: stream,
        model: ModelConfig[modelName]?.name,
        messages,
        temperature: temperature || 0,
        top_p: otherProps.topP,
        frequency_penalty: otherProps.frequencyPenalty,
        presence_penalty: otherProps.presencePenalty,
        max_tokens: otherProps.maxTokens,
        signal: abortController?.signal,
        tools: openAiTools,
        ...(openAiTools?.length > 0
          ? {
              tool_choice: 'auto',
            }
          : {}),
      },
      null,
      2
    )
  );

  try {
    const output = await model.call({
      handleStream: stream,
      model: ModelConfig[modelName]?.name,
      messages,
      temperature: temperature || 0,
      top_p: otherProps.topP,
      frequency_penalty: otherProps.frequencyPenalty,
      presence_penalty: otherProps.presencePenalty,
      max_tokens: otherProps.maxTokens,
      signal: abortController?.signal,
      tools: openAiTools,
      ...(openAiTools?.length > 0
        ? {
            tool_choice: 'auto',
          }
        : {}),
    });

    const answer = output?.answer;

    const usage = {
      completionTokens: output?.usage?.completion_tokens,
      promptTokens: output?.usage?.prompt_tokens,
      totalTokens: output?.usage?.total_tokens,
      cost: getUsageCost({
        modelName,
        usage: output?.usage!,
      }),
    };

    return {
      answer,
      usage,
      sources: retrievalData?.sources || [],
      approvals,
    } as ChatResponse;
  } catch (err: any) {
    if (err?.message?.includes('ToolApprovalRequired')) {
      return {
        answer: '',
        usage: {},
        approvals,
        sources: [] as Source[],
      } as ChatResponse;
    } else {
      throw err;
    }
  }
};

export default chat;
