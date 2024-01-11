import {
  ChatCompletionMessageParam,
  ChatCompletionTool,
} from 'openai/resources';

import { AgentModelName, Message, Tool, ToolType } from '@chaindesk/prisma';

import { handler as datastoreToolHandler } from './agent/tools/datastore';
import {
  createHandler as createFormToolHandler,
  // createHandlerTest as createFormToolHandlerTest,
  createParser as createParserFormTool,
  // createParserTest as createParserFormToolTest,
  toJsonSchema as formToolToJsonSchema,
  // toJsonSchemaTest as formToolToJsonSchemaTest,
} from './agent/tools/form';
import {
  createHandler as createHttpToolHandler,
  createParser as createParserHttpTool,
  toJsonSchema as httpToolToJsonSchema,
} from './agent/tools/http';
import { CreateToolHandler, CreateToolHandlerConfig } from './agent/tools/type';
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
import createToolParser from './create-tool-parser';
import formatMessagesOpenAI from './format-messages-openai';
import getUsageCost from './get-usage-cost';
import promptInject from './prompt-inject';
import truncateChatMessages from './truncateChatMessages';

export type ChatProps = ChatModelConfigSchema & {
  systemPrompt?: string;
  userPrompt?: string;
  query: string;
  retrievalQuery?: string;
  stream?: any;
  modelName?: AgentModelName;
  history?: Message[];
  abortController?: AbortController;
  context?: string;
  useXpContext?: boolean;
  tools?: Tool[];
  filters?: ChatRequest['filters'];
  topK?: number;
  toolsConfig?: ChatRequest['toolsConfig'];
  conversationId?: ChatRequest['conversationId'];
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
  toolsConfig,
  conversationId,
  retrievalQuery,
  ...otherProps
}: ChatProps) => {
  // Tools
  const nbDatastoreTools =
    tools?.filter((each) => each.type === 'datastore')?.length || 0;

  const datastoreTools = (tools as ToolSchema[]).filter(
    (each) => each.type === ToolType.datastore
  ) as ToolSchema[];

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

  let metadata: object | undefined = undefined;

  const createHandler =
    (handler: CreateToolHandler) =>
    (tool: ToolSchema, config: CreateToolHandlerConfig) =>
    async (args: unknown) => {
      const res = await handler(tool, config)(args);

      if (res.approvalRequired) {
        return handleToolWithApproval({
          tool,
          payload: args,
        });
      }

      if (res.metadata) {
        metadata = {
          ...metadata,
          ...res.metadata,
        };
      }

      return res.data;
    };

  const formatedHttpTools = httpTools.map((each) => {
    const toolConfig = each?.id ? toolsConfig?.[each?.id] : undefined;
    const config = { toolConfig, conversationId };

    return {
      type: 'function',

      function: {
        ...httpToolToJsonSchema(each, config),
        parse: createParserHttpTool(each, config),
        function: createHandler(createHttpToolHandler)(each, config),
      },
      // } as RunnableToolFunction<HttpToolPayload>)
    } as ChatCompletionTool;
  });

  const formatedFormTools = formTools.map((each) => {
    const toolConfig = each?.id ? toolsConfig?.[each?.id] : undefined;
    const config = { toolConfig, conversationId };

    return {
      type: 'function',
      function: {
        ...formToolToJsonSchema(each, config),
        parse: createParserFormTool(each, config),
        function: createHandler(createFormToolHandler)(each, config),
      },
    } as ChatCompletionTool;
  });

  let retrievalData:
    | Awaited<ReturnType<typeof datastoreToolHandler>>
    | undefined = undefined;

  if (userPrompt?.includes('{context}')) {
    retrievalData = await datastoreToolHandler({
      maxTokens: ModelConfig?.[modelName!]?.maxTokens * 0.2,
      query: retrievalQuery || query,
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
              description: `Useful to fetch informations from the knowledge base (${datastoreTools
                .map((each) => each?.datastore?.name)
                .join(', ')})`,
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
                  query: retrievalQuery || query,
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
      metadata,
    } as ChatResponse;
  } catch (err: any) {
    if (err?.message?.includes('ToolApprovalRequired')) {
      return {
        answer: '',
        usage: {},
        approvals,
        sources: [] as Source[],
        metadata,
      } as ChatResponse;
    } else {
      throw err;
    }
  }
};

export default chat;
