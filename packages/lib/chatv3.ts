import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import {
  ChatCompletionMessageParam,
  ChatCompletionTool,
} from 'openai/resources';

import { AgentModelName, Message, Tool, ToolType } from '@chaindesk/prisma';

import { handler as datastoreToolHandler } from './agent/tools/datastore';
import {
  createHandler as createFormToolHandler,
  createParser as createParserFormTool,
  toJsonSchema as formToolToJsonSchema,
} from './agent/tools/form';
import {
  createHandler as createHttpToolHandler,
  createParser as createParserHttpTool,
  toJsonSchema as httpToolToJsonSchema,
} from './agent/tools/http';
import {
  createHandler as createLeadCaptureToolHandler,
  createParser as createParserLeadCaptureTool,
  toJsonSchema as leadCaptureToolToJsonSchema,
} from './agent/tools/lead-capture';
import {
  createHandler as createMarkAsResolvedToolHandler,
  toJsonSchema as markAsResolvedToolToJsonSchema,
} from './agent/tools/mark-as-resolved';
import {
  createHandler as createRequestHumanToolHandler,
  toJsonSchema as requestHumanToolToJsonSchema,
} from './agent/tools/request-human';
import {
  CreateToolHandler,
  CreateToolHandlerConfig,
  ToolPayload,
} from './agent/tools/type';
import type { Source } from './types/document';
import {
  ChatModelConfigSchema,
  ChatRequest,
  ChatResponse,
  FormToolSchema,
  HttpToolSchema,
  LeadCaptureToolSchema,
  MarkAsResolvedToolSchema,
  RequestHumanToolSchema,
  ToolSchema,
} from './types/dtos';
import ChatModel from './chat-model';
import { ModelConfig } from './config';
import createToolParser from './create-tool-parser';
import formatMessagesOpenAI from './format-messages-openai';
import getUsageCost from './get-usage-cost';
import promptInject from './prompt-inject';
import {
  createLeadCapturePrompt,
  MARK_AS_RESOLVED,
  REQUEST_HUMAN,
} from './prompt-templates';
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
  organizationId: string;
  agentId: string;
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
  organizationId,
  agentId,
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

  const markAsResolvedTool = (tools as ToolSchema[]).find(
    (each) => each.type === ToolType.mark_as_resolved
  ) as MarkAsResolvedToolSchema;

  const requestHumanTool = (tools as ToolSchema[]).find(
    (each) => each.type === ToolType.request_human
  ) as RequestHumanToolSchema;

  const leadCaptureTool = (tools as ToolSchema[]).find(
    (each) => each.type === ToolType.lead_capture
  ) as LeadCaptureToolSchema;

  const approvals: ChatResponse['approvals'] = [];

  const handleToolWithApproval = async (
    props: ChatResponse['approvals'][0]
  ) => {
    approvals.push(props);

    throw 'ToolApprovalRequired';
  };

  let metadata: object | undefined = undefined;

  const baseConfig = {
    conversationId,
    modelName,
    organizationId,
    agentId,
  };

  const createHandler =
    <T extends { type: ToolType }>(handler: CreateToolHandler<T>) =>
    (tool: ToolSchema & T, config: CreateToolHandlerConfig<T>) =>
    async (args: ToolPayload<T>) => {
      const res = await handler(tool, config)(args);

      if (res?.approvalRequired) {
        return handleToolWithApproval({
          tool,
          payload: args,
        });
      }

      if (res?.metadata) {
        metadata = {
          ...metadata,
          ...res?.metadata,
        };
      }

      return res?.data;
    };

  const formatedHttpTools = httpTools.map((each) => {
    const toolConfig = each?.id ? toolsConfig?.[each?.id] : undefined;
    const config = { ...baseConfig, toolConfig };

    return {
      type: 'function',
      function: {
        ...httpToolToJsonSchema(each),
        parse: createParserHttpTool(each, config),
        function: createHandler<{ type: 'http' }>(createHttpToolHandler)(
          each,
          config
        ),
      },
      // } as RunnableToolFunction<HttpToolPayload>)
    } as ChatCompletionTool;
  });

  const formatedFormTools = formTools.map((each) => {
    const toolConfig = each?.id ? toolsConfig?.[each?.id] : undefined;
    const config = { ...baseConfig, toolConfig };

    return {
      type: 'function',
      function: {
        ...formToolToJsonSchema(each, config),
        parse: createParserFormTool(each, config),
        function: createHandler(createFormToolHandler)(each, config),
      },
    } as ChatCompletionTool;
  });

  const formatedMarkAsResolvedTool = !!markAsResolvedTool
    ? ({
        type: 'function',
        function: {
          ...markAsResolvedToolToJsonSchema(markAsResolvedTool, {
            ...baseConfig,
          }),
          parse: JSON.parse,
          function: createHandler(createMarkAsResolvedToolHandler)(
            markAsResolvedTool,
            { ...baseConfig }
          ),
        },
      } as ChatCompletionTool)
    : undefined;

  const formatedRequestHumanTool = !!requestHumanTool
    ? ({
        type: 'function',
        function: {
          ...requestHumanToolToJsonSchema(requestHumanTool, {
            ...baseConfig,
          }),
          parse: JSON.parse,
          function: createHandler(createRequestHumanToolHandler)(
            requestHumanTool,
            { ...baseConfig }
          ),
        },
      } as ChatCompletionTool)
    : undefined;

  const formatedLeadCaptureTool = !!leadCaptureTool
    ? ({
        type: 'function',
        function: {
          ...leadCaptureToolToJsonSchema(leadCaptureTool, {
            ...baseConfig,
          }),
          parse: createParserLeadCaptureTool(leadCaptureTool, {
            ...baseConfig,
          }),
          function: createHandler(createLeadCaptureToolHandler)(
            leadCaptureTool,
            { ...baseConfig }
          ),
        },
      } as ChatCompletionTool)
    : undefined;

  let retrievalData:
    | Awaited<ReturnType<typeof datastoreToolHandler>>
    | undefined = undefined;

  const isContextAware = userPrompt?.includes('{context}');
  if (isContextAware) {
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

  let _systemPrompt = systemPrompt || '';

  if (!!markAsResolvedTool) {
    _systemPrompt += `\n${MARK_AS_RESOLVED}`;
  }

  if (!!requestHumanTool) {
    _systemPrompt += `\n${REQUEST_HUMAN}`;
  }

  if (!!leadCaptureTool) {
    _systemPrompt += `\n${createLeadCapturePrompt({
      isEmailEnabled: !!leadCaptureTool.config.isEmailEnabled,
      isPhoneNumberEnabled: !!leadCaptureTool.config.isPhoneNumberEnabled,
      isRequiredToContinue: !!leadCaptureTool.config.isRequired,
    })}`;
  }

  const messages: ChatCompletionMessageParam[] = [
    ...(_systemPrompt
      ? [
          {
            role: 'system',
            content: `the system prompt to respect is the following: ${_systemPrompt}.${
              isContextAware
                ? `And the context for this chat is this ${promptInject({
                    template: userPrompt || '{query}',
                    query: query,
                    context: retrievalData?.context,
                  })}`
                : ''
            } `,
          } as ChatCompletionMessageParam,
        ]
      : []),
    ...truncatedHistory,
    {
      role: 'user',
      content: query,
    },
  ];

  const model = new ChatModel();

  const openAiTools = [
    ...formatedHttpTools,
    ...formatedFormTools,
    ...(formatedMarkAsResolvedTool ? [formatedMarkAsResolvedTool] : []),
    ...(formatedRequestHumanTool ? [formatedRequestHumanTool] : []),
    ...(formatedLeadCaptureTool ? [formatedLeadCaptureTool] : []),
  ] as ChatCompletionTool[];

  const embeddings = new OpenAIEmbeddings();

  const toolVectorStore = await MemoryVectorStore.fromTexts(
    openAiTools.map((tool) => tool?.function?.description || 'tool'),
    openAiTools.map((_, index) => {
      return { index }; // To conform to the Record<string,unknown> typing of the lib.
    }),
    embeddings
  );

  // Always try to make a highly similar datastore available to the model.
  const datastoreVectorStore = await MemoryVectorStore.fromTexts(
    datastoreTools.map((tool) => tool?.datastore?.pluginDescriptionForModel),
    datastoreTools.map((_, index) => {
      return { index };
    }),
    embeddings
  );

  const toolSimilarityScores = await toolVectorStore.similaritySearchWithScore(
    query
  );
  const datastoreSimilarityScores =
    await datastoreVectorStore.similaritySearchWithScore(query);

  // high similar score.
  const topToolsIndexs = toolSimilarityScores
    .filter((each) => each[1] > 0.8)
    .map((each) => each[0].metadata.index);

  const topDatastoresIndexs = datastoreSimilarityScores
    .filter((each) => each[1] > 0.8)
    .map((each) => each[0].metadata.index);

  const knowledgeTool = [
    ...(nbDatastoreTools > 0
      ? [
          {
            type: 'function',
            function: {
              name: 'queryKnowledgeBase',
              description: `${datastoreTools
                .filter((_, index) => topToolsIndexs.includes(index))
                .map(
                  (store) =>
                    `${store.datastore.name} - ${store.datastore.description}`
                )}`,
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
                  tools: datastoreTools.filter((_, index) =>
                    topToolsIndexs.includes(index)
                  ) as Tool[],
                  filters: filters,
                  topK: topK,
                  similarityThreshold: 0.8,
                });
                return retrievalData.context;
              },
            },
          } as ChatCompletionTool,
        ]
      : []),
  ];

  const reducedTools = [
    ...openAiTools.filter((_, index) => topDatastoresIndexs.includes(index)),
    ...knowledgeTool,
  ];

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
      tools: reducedTools as ChatCompletionTool[],
      ...(reducedTools?.length > 0
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
