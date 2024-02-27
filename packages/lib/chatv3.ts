import {
  ChatCompletionMessageParam,
  ChatCompletionTool,
} from 'openai/resources';
import { z } from 'zod';

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

  // if (userPrompt?.includes('{context}')) {
  retrievalData = await datastoreToolHandler({
    maxTokens: Math.min(ModelConfig?.[modelName!]?.maxTokens * 0.2, 3000), // limit RAG to max 3K tokens
    query: retrievalQuery || query,
    tools: tools,
    filters: filters,
    topK: topK,
    similarityThreshold: 0.7,
  });
  // }

  // Messages
  const truncatedHistory = (
    await truncateChatMessages({
      messages: formatMessagesOpenAI(history || []).reverse(),
      maxTokens: ModelConfig[modelName]?.maxTokens * 0.3, // 30% tokens limit for history
    })
  ).reverse();

  let _systemPrompt = systemPrompt || '';

  const model = new ChatModel();

  try {
    let sequence = 'query_knowledge_base';

    try {
      const sequenceDetectionInstructions =
        cleanTextForEmbeddings(`Your goal is to detect the most relevant sequence for the conversation based on the conversation history.
      Possible Sequences:
      ${
        !!leadCaptureTool
          ? `name: lead_capture
            description: Until the AI has collected all user informations properly and the AI looks ready to move to another sequence.`
          : ''
      }
      ${
        !!requestHumanTool
          ? `name: request_human
      description: When the user isnot satisfied with the AI answers`
          : ``
      }
      ${
        !!markAsResolvedTool
          ? `name: mark_as_resolved
      description: When the user is satisfied with the AI answersm the user questions are properly answered and the conversation can be safely marked as resolved.`
          : ``
      }
      ${
        formatedHttpTools.length > 0
          ? formatedHttpTools
              .map(
                (each) =>
                  `name: ${each?.function?.name} \ndescription: ${each.function?.description}`
              )
              .join('\n')
          : ''
      }
      ${
        formatedFormTools.length > 0
          ? formatedFormTools
              .map(
                (each) =>
                  `name: ${each?.function?.name} \ndescription: ${each.function?.description}`
              )
              .join('\n')
          : ''
      }
      name: None
      description: When none of the above sequences are detected.

    Sequences Priorities:
    ${
      !!leadCaptureTool
        ? `
    - The conversation should be in the lead_capture sequence until the user informations have been provided, even if the user ask questions related to another sequence.
    - Only when the user informations have been provided, the conversation should move to another sequence.`
        : ``
    }
    
    Provide your output in json format with the key: sequence.
      `);

      console.log(
        'sequenceDetectionInstructions',
        sequenceDetectionInstructions
      );

      const sequenceDetection = await new ChatModel().call({
        model: ModelConfig['gpt_3_5_turbo']?.name,
        messages: [
          {
            role: 'system',
            content: sequenceDetectionInstructions,
          },
          ...truncatedHistory,
          {
            role: 'user',
            content: query,
          },
        ],
        signal: abortController?.signal,
        temperature: 0,
        // tool_choice: 'auto',
        response_format: {
          type: 'json_object',
        },
        // tools: [
        //   {
        //     type: 'function',
        //     function: {
        //       name: 'sequence_detection',
        //       description: 'Sequence detection',
        //       parse: (data: string) =>
        //         z.object({ sequence: z.string() }).parse(JSON.parse(data)),
        //       function: async (sequence: string) => {
        //         return { sequence };
        //       },
        //       parameters: {
        //         type: 'object',
        //         properties: {
        //           sequence: {
        //             type: 'string',
        //             enum: [
        //               'query_knowledge_base',
        //               'request_human',
        //               'mark_as_resolved',
        //               'lead_capture',
        //               'http_tool',
        //             ],
        //           },
        //         },
        //       },
        //     },
        //   },
        // ],
      });

      sequence = JSON.parse(sequenceDetection?.answer!)?.sequence as string;
    } catch (err) {
      console.log('Sequence detection error', err);
    }

    console.log('SEQUENCE ----------------------------------->', sequence);

    if (!!markAsResolvedTool && sequence === 'mark_as_resolved') {
      _systemPrompt += `\n${MARK_AS_RESOLVED}`;
    }

    if (!!requestHumanTool && sequence === 'request_human') {
      _systemPrompt += `\n${REQUEST_HUMAN}`;
    }

    if (!!leadCaptureTool && sequence === 'lead_capture') {
      _systemPrompt += `\n${createLeadCapturePrompt({
        isEmailEnabled: !!leadCaptureTool.config.isEmailEnabled,
        isPhoneNumberEnabled: !!leadCaptureTool.config.isPhoneNumberEnabled,
        isRequiredToContinue: !!leadCaptureTool.config.isRequired,
      })}`;
    }

    // _systemPrompt += `\nStart the conversation by collecting the user informations specified by the lead capture v2 tool.`;

    // _systemPrompt += `\n Finish your answer with a recommendation for a relevant html input element to show the user based on your answer. example:

    // User: Hello,
    // You: Can you provide your email adress in case we need to contact you later? UI: email

    // Possible values are email, phone, file_upload, none`;

    const messages: ChatCompletionMessageParam[] = [
      ...(_systemPrompt
        ? [
            {
              role: 'system',
              content: `${_systemPrompt}${
                sequence !== 'None'
                  ? ``
                  : `\n<knowledge-base>
              ${retrievalData?.context}
            </knowledge-base>`
              }`,
            } as ChatCompletionMessageParam,
          ]
        : []),
      ...truncatedHistory,
      {
        role: 'user',
        content: promptInject({
          // template:
          //   sequence === 'query_knowledge_base'
          //     ? `<knowledge-base>
          // ${retrievalData?.context}
          // </knowledge-base>
          // Question: {query}`
          //     : '{query}',
          template: userPrompt || '{query}',
          query: query,
          context: retrievalData?.context,
        }),
      },
    ];

    const openAiTools = [
      ...(formatedHttpTools
        ? formatedHttpTools.filter((each) => each.function?.name === sequence)
        : []),
      ...(formatedFormTools
        ? formatedFormTools.filter((each) => each.function?.name === sequence)
        : []),
      ...(formatedMarkAsResolvedTool && sequence === 'mark_as_resolved'
        ? [formatedMarkAsResolvedTool]
        : []),
      ...(formatedRequestHumanTool && sequence === 'request_human'
        ? [formatedRequestHumanTool]
        : []),
      ...(formatedLeadCaptureTool && sequence === 'lead_capture'
        ? [formatedLeadCaptureTool]
        : []),
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
