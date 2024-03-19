import {
  ChatCompletionMessageParam,
  ChatCompletionTool,
} from 'openai/resources';
import { z } from 'zod';

import {
  Agent,
  AgentModelName,
  Message,
  Tool,
  ToolType,
} from '@chaindesk/prisma';

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
import cleanTextForEmbeddings from './clean-text-for-embeddings';
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

  // Behaviors
  useMarkdown?: boolean;
  useLanguageDetection?: boolean;
  restrictKnowledge?: boolean;
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
  useMarkdown,
  useLanguageDetection,
  restrictKnowledge,
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

  // if (userPrompt?.includes('{context}')) {
  retrievalData = await datastoreToolHandler({
    maxTokens: Math.min(ModelConfig?.[modelName!]?.maxTokens * 0.2, 3000), // limit RAG to max 3K tokens
    query: retrievalQuery || query,
    tools: tools,
    filters: filters,
    topK: topK,
    similarityThreshold: 0.78,
  });
  // }

  // Messages
  const truncatedHistory = (
    await truncateChatMessages({
      messages: formatMessagesOpenAI(history || []).reverse(),
      maxTokens: ModelConfig[modelName]?.maxTokens * 0.3, // 30% tokens limit for history
    })
  ).reverse();

  const model = new ChatModel();

  try {
    // if (!!markAsResolvedTool) {
    //   _systemPrompt += `\n${MARK_AS_RESOLVED}`;
    // }

    // if (!!requestHumanTool) {
    //   _systemPrompt += `\n${REQUEST_HUMAN}`;
    // }

    // if (!!leadCaptureTool) {
    //   _systemPrompt += `\n${createLeadCapturePrompt({
    //     isEmailEnabled: !!leadCaptureTool.config.isEmailEnabled,
    //     isPhoneNumberEnabled: !!leadCaptureTool.config.isPhoneNumberEnabled,
    //     isRequiredToContinue: !!leadCaptureTool.config.isRequired,
    //   })}`;
    // }

    const infos = [
      ...(leadCaptureTool?.config?.isEmailEnabled ? ['email'] : []),
      ...(leadCaptureTool?.config?.isPhoneNumberEnabled
        ? ['phone number and phone extension']
        : []),
    ].join(' and ');

    const requestHumanInstructions = `If the user is not satisfied with the assistant answers, offer to request a human operator, then if the user accepts call \`request_human\` to request a human to take over the conversation.`;
    const markAsResolvedInstructions = `If the user is happy with your answer, call \`mark_as_resolved\` to mark the conversation as resolved.`;

    const knowledgeInstructions = `${
      !!datastoreTools?.length
        ? `Use the following portion of a long document to see if any of the text is relevant to answer the question. <knowledge-base>${
            retrievalData?.context
          }</knowledge-base>
    ${
      !!restrictKnowledge
        ? `Limit your knowledge to the knowledge base, if you don't find an answer in the knowledge base, politely say that you don't know. Remember do not answer any query that is outside of the provided context, this is paramount.`
        : ``
    }
    `
        : ``
    }`.trim();

    const _systemPrompt = `${systemPrompt}
    ${
      !!leadCaptureTool
        ? `**Lead Capture**
    1. Start the conversation by greeting the user and asking for his ${infos} in order to contact them if necessary.
    2. If the user provides their ${infos}, confirm receipt.
    3. If the user does not provide his ${infos}, politely ask again.
    5. Make sure the ${infos} is/are valid and are not empty before proceeding.
    4. After the user has provided a valid ${infos}, thank them and save the email whith the lead capture tool.
    ${
      leadCaptureTool?.config?.isRequired
        ? `5. If the user refuses to provide his ${infos}, politely inform the user that you need the ${infos} to continue the conversation. Do not continue until the user has provided valid ${infos}.`
        : ``
    }`
        : ``
    }
    ${
      useMarkdown
        ? `Answer using markdown to display the content in a nice and aerated way.`
        : ``
    }
    ${
      useLanguageDetection
        ? `Answer the users question in the same language as the user question. You are able to speak any language.`
        : ``
    }
    ${
      // use useLanguageDetection for this too until we add a checkbox in the ui
      useLanguageDetection
        ? `Never make up URLs, email addresses, or any other information that have not been provided during the conversation. Only use information provided by the user to fill forms.`
        : ``
    }
    ${!!markAsResolvedTool ? markAsResolvedInstructions : ``}
    ${!!requestHumanTool ? requestHumanInstructions : ``}
    ${knowledgeInstructions}
    `.trim();

    const messages: ChatCompletionMessageParam[] = [
      ...(_systemPrompt
        ? [
            {
              role: 'system',
              content: _systemPrompt,
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

    const openAiTools = [
      ...formatedHttpTools,
      ...formatedFormTools,
      ...(formatedMarkAsResolvedTool ? [formatedMarkAsResolvedTool] : []),
      ...(formatedRequestHumanTool ? [formatedRequestHumanTool] : []),
      ...(formatedLeadCaptureTool ? [formatedLeadCaptureTool] : []),
      // ...(nbDatastoreTools > 0
      //   ? [
      //       {
      //         type: 'function',
      //         function: {
      //           name: 'queryKnowledgeBase',
      //           description: `Useful to fetch informations from the knowledge base (${datastoreTools
      //             .map((each) => each?.datastore?.name)
      //             .join(', ')})`,
      //           parameters: {
      //             type: 'object',
      //             properties: {},
      //           },
      //           parse: JSON.parse,
      //           function: async () => {
      //             if (retrievalData) {
      //               return retrievalData.context;
      //             }

      //             retrievalData = await datastoreToolHandler({
      //               maxTokens: ModelConfig?.[modelName!]?.maxTokens * 0.2,
      //               query: retrievalQuery || query,
      //               tools: tools,
      //               filters: filters,
      //               topK: topK,
      //               similarityThreshold: 0.7,
      //             });
      //             return retrievalData.context;
      //           },
      //         },
      //       } as ChatCompletionTool,
      //     ]
      //   : []),
    ] as ChatCompletionTool[];

    const callParams = {
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
    } as Parameters<typeof model.call>[0];

    console.log('CHAT V3 PAYLOAD', JSON.stringify(callParams, null, 2));

    const output = await model.call(callParams);

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
