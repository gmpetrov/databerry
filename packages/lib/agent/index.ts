import { ChatCompletionMessageParam } from 'openai/resources';

import {
  Agent,
  Datastore,
  Form,
  Message,
  PromptType,
  Tool,
} from '@chaindesk/prisma';

import chatRetrieval from '../chains/chat-retrieval';
import chatv3 from '../chatv3';
import createPromptContext from '../create-prompt-context';
import promptInject from '../prompt-inject';
import {
  ANSWER_IN_SAME_LANGUAGE,
  KNOWLEDGE_RESTRICTION,
  MARKDOWN_FORMAT_ANSWER,
} from '../prompt-templates';
import truncateByModel from '../truncate-by-model';
import { ChatRequest } from '../types/dtos';
import { ChatModelConfigSchema } from '../types/dtos';

type ToolExtended = Tool & {
  datastore: Datastore | null;
  form: Form | null;
};

export type AgentWithTools = Agent & {
  tools: ToolExtended[];
};

export type HttpToolPayload = {
  [key: string]: unknown;
};

type AgentManagerProps = ChatModelConfigSchema &
  Pick<
    ChatRequest,
    | 'modelName'
    | 'truncateQuery'
    | 'filters'
    | 'promptType'
    | 'promptTemplate'
    | 'systemPrompt'
    | 'userPrompt'
    | 'toolsConfig'
    | 'conversationId'
  > & {
    channel?: ChatRequest['channel'];
    input: string;
    stream?: any;
    history?: Message[] | undefined;
    abortController?: any;
    retrievalQuery?: string;
  };

const SIMILARITY_THRESHOLD = 0.7;
export default class AgentManager {
  agent: AgentWithTools;
  topK?: number;

  constructor({ agent, topK }: { agent: AgentWithTools; topK?: number }) {
    this.agent = agent;
    this.topK = topK;
  }

  async query(props: AgentManagerProps) {
    let systemPrompt = props.systemPrompt || this.agent.systemPrompt || '';
    let userPrompt =
      props.userPrompt || this.agent.userPrompt?.trim?.() || '{query}';

    //     const hasBehaviors =
    //       this.agent.useMarkdown ||
    //       this.agent.useLanguageDetection ||
    //       this.agent.restrictKnowledge;
    return chatv3({
      ...props,
      organizationId: this.agent.organizationId!,
      conversationId: props.conversationId,
      modelName: this.agent.modelName,
      filters: props.filters,
      query: props.input,
      tools: this.agent.tools,
      userPrompt,
      systemPrompt,
      agentId: this.agent.id,
      topK: this.topK,

      // Behaviors
      useLanguageDetection: !!this.agent.useLanguageDetection,
      restrictKnowledge: !!this.agent.restrictKnowledge,
      useMarkdown: !!this.agent.useMarkdown,
    });
    // let answer: string = '';
    // let sources: Source[] = [];
    // let usage: ChatResponse['usage'] | undefined = undefined;

    // const nbToolsOtherThanDatastore =
    //   this.agent.tools.filter((each) => each.type !== 'datastore')?.length || 0;

    // const nbDatastoreTools =
    //   this.agent.tools.filter((each) => each.type === 'datastore')?.length || 0;

    // const prevMessages = (props.history || [])?.map((each) => {
    //   if (each.from === 'human') {
    //     return new HumanMessage(each.text);
    //   }
    //   return new AIMessage(each.text);
    // });

    // const truncatedHistory = (
    //   await truncateChatMessages({
    //     messages: formatMessagesOpenAI(props.history || []).reverse(),
    //     maxTokens: ModelConfig[this.agent.modelName]?.maxTokens * 0.3, // 30% tokens limit for history
    //   })
    // ).reverse();

    // if (nbToolsOtherThanDatastore <= 0) {
    //   return this.defaultQuery(props);
    // } else {
    //   const httpTools = (this.agent.tools as ToolSchema[]).filter(
    //     (each) => each.type === ToolType.http
    //   ) as HttpToolSchema[];

    //   const openAiTools = httpTools.map(
    //     (each, index) =>
    //       ({
    //         type: 'function',

    //         function: {
    //           // name: each?.config?.description,
    //           name: `${each.id}`,
    //           description: each?.config?.description,

    //           parameters: {
    //             type: 'object',
    //             properties: {
    //               ...each?.config?.headers
    //                 ?.filter((each) => !!each.isUserProvided)
    //                 ?.map((each) => ({
    //                   [each.key]: {
    //                     type: 'string',
    //                   },
    //                 }))
    //                 .reduce((acc, curr) => ({ ...acc, ...curr }), {}),
    //               ...each?.config?.body
    //                 ?.filter((each) => !!each.isUserProvided)
    //                 ?.map((each) => ({
    //                   [each.key]: {
    //                     type: 'string',
    //                   },
    //                 }))
    //                 .reduce((acc, curr) => ({ ...acc, ...curr }), {}),
    //               ...each?.config?.queryParameters
    //                 ?.filter((each) => !!each.isUserProvided)
    //                 ?.map((each) => ({
    //                   [each.key]: {
    //                     type: 'string',
    //                   },
    //                 }))
    //                 .reduce((acc, curr) => ({ ...acc, ...curr }), {}),
    //             },
    //             required: [],
    //           },
    //           parse: JSON.parse,
    //           function: createHttpToolHandler(each),
    //         },
    //         // } as RunnableToolFunction<HttpToolPayload>)
    //       } as ChatCompletionTool)
    //   );

    //   const model = new ChatModel();

    //   let systemPrompt = this.agent.prompt;
    //   if (this.agent.promptType === 'customer_support') {
    //     systemPrompt = `${this.agent.prompt}
    //     Answer the query in the same language in which the query is asked.
    //     Give answer in the markdown rich format with proper bolds, italics etc as per heirarchy and readability requirements.
    //     You will be provided by a context retrieved by the knowledge_base_retrieval function.
    //     If the context does not contain the information needed to answer this query then politely say that you don't know without mentioning the existence of a context.
    //     Remember do not answer any query that is outside of the provided context nor mention its existence.
    //     You are allowed to use the following conversation history to answer the query.
    //     `;
    //   }

    //   const messages: ChatCompletionMessageParam[] = [
    //     ...(systemPrompt
    //       ? [{ role: 'system', content: systemPrompt! } as any]
    //       : []),
    //     ...truncatedHistory,
    //     {
    //       role: 'user',
    //       content: props.input,
    //     },
    //   ];

    //   const res = await model.call({
    //     handleStream: props.stream,
    //     model: ModelConfig[this.agent.modelName]?.name,
    //     signal: props.abortController?.signal,
    //     temperature: props.temperature,
    //     top_p: props.topP,
    //     presence_penalty: props.presencePenalty,
    //     frequency_penalty: props.frequencyPenalty,
    //     max_tokens: props.maxTokens,
    //     messages,
    //     tools: [
    //       ...openAiTools,
    //       ...(nbDatastoreTools > 0
    //         ? [
    //             {
    //               type: 'function',
    //               function: {
    //                 name: 'queryKnowledgeBase',
    //                 description: 'Use it for any other query',
    //                 parameters: {
    //                   type: 'object',
    //                   properties: {},
    //                 },
    //                 parse: JSON.parse,
    //                 function: async () => {
    //                   const res = await datastoreToolHandler({
    //                     query: props.input,
    //                     tools: this.agent.tools,
    //                     filters: props.filters,
    //                     topK: this.topK,
    //                     modelName: this.agent.modelName,
    //                     similarityThreshold: 0.7,
    //                   });
    //                 },
    //               },
    //             } as ChatCompletionTool,
    //           ]
    //         : []),
    //     ],
    //     tool_choice: 'auto',
    //   });

    //   console.log('RES2==--------------->', JSON.stringify(res, null, 2));

    // const model = new ChatOpenAI({
    //   modelName: 'gpt-4-1106-preview',
    //   temperature: 0,
    //   streaming: Boolean(props.stream),
    //   onFailedAttempt: failedAttemptHandler,
    //   callbacks: [
    //     {
    //       handleLLMNewToken: props.stream,
    //     },
    //   ],
    // });

    // const res = await model.call(
    //   [...prevMessages, new HumanMessage(props.input)],
    //   {
    //     tools: [
    //       ...openAiTools,
    //       // {
    //       //   name: 'getOrderInformation',
    //       //   description: 'Get order information',
    //       //   parameters: {
    //       //     type: 'object',
    //       //     properties: {
    //       //       orderId: {
    //       //         type: 'string',
    //       //       },
    //       //     },
    //       //     required: ['orderId'],
    //       //   },
    //       // },
    //       ...(nbDatastoreTools > 0
    //         ? [
    //             {
    //               name: 'queryKnowledgeBase',
    //               description: 'Use it for any other questions',
    //               parameters: {
    //                 type: 'object',
    //                 properties: {},
    //               },
    //             },
    //           ]
    //         : []),
    //     ],
    //   }
    // );

    // const json = JSON.parse(
    //   res?.additional_kwargs?.function_call?.arguments || `{}`
    // );

    // const action = res?.additional_kwargs?.function_call?.name;

    // console.log('ACTION', action);

    // const streamModel = new ChatOpenAI({
    //   modelName: 'gpt-4',
    //   temperature: 0,
    //   streaming: Boolean(props.stream),
    //   onFailedAttempt: failedAttemptHandler,
    //   callbacks: [
    //     {
    //       handleLLMNewToken: props.stream,
    //     },
    //   ],
    // });

    // const httpTool = this.agent.tools.find((one) => one.id === action);

    // if (httpTool) {
    //   // TODO: fetch order information
    //   const config = httpTool?.config as HttpToolSchema['config'];

    //   const inputUrl = new URL(config.url);
    //   const inputQUeryParams = new URLSearchParams(inputUrl.search);

    //   config?.queryParameters
    //     ?.filter((each) => !each.isUserProvided)
    //     .forEach((each) => {
    //       if (each.value) {
    //         inputQUeryParams.set(each.key, each.value);
    //       } else if (json[each.key]) {
    //         inputQUeryParams.set(each.key, json[each.key]);
    //       }
    //     });

    //   const url = `${inputUrl.origin}${
    //     inputUrl.pathname
    //   }?${inputQUeryParams.toString()}`;

    //   const { data } = await axios(url, {
    //     method: config?.method,
    //     headers: {
    //       ...config?.headers
    //         ?.filter((each) => !each.isUserProvided)
    //         .reduce((acc, curr) => ({ ...acc, [curr.key]: curr.value }), {}),
    //       ...config?.headers
    //         ?.filter((each) => !!each.isUserProvided)
    //         .reduce(
    //           (acc, curr) => ({ ...acc, [curr.key]: json[curr.key] }),
    //           {}
    //         ),
    //     },
    //     data: {
    //       ...config?.body
    //         ?.filter((each) => !each.isUserProvided)
    //         .reduce((acc, curr) => ({ ...acc, [curr.key]: curr.value }), {}),
    //       ...config?.body
    //         ?.filter((each) => !!each.isUserProvided)
    //         .reduce(
    //           (acc, curr) => ({ ...acc, [curr.key]: json[curr.key] }),
    //           {}
    //         ),
    //     },
    //   });

    //   console.log('ACALl------------------------>');

    //   return {
    //     answer: (
    //       await streamModel.call(
    //         [
    //           ...prevMessages,
    //           new HumanMessage(`

    //           Goal:
    //           ${config?.description}

    //           Fetched Data:
    //           ${data ? JSON.stringify(data, null, 2) : 'No data found'}

    //           Question:
    //           ${props.input}

    //           Answer politely:
    //         `),
    //         ],
    //         {}
    //       )
    //     )?.text?.trim(),
    //     sources: [],
    //   };
    // } else if (action === 'queryKnowledgeBase') {
    //   return this.defaultQuery(props);
    // }

    // const answer = (res?.content as string)?.trim();
    // answer = res?.answer?.trim() as string;

    // return {
    //   answer,
    //   sources,
    //   usage,
    // };
    // }
  }

  async defaultQuery({
    input,
    stream,
    history,
    truncateQuery,
    filters,
    promptType,
    promptTemplate,
    abortController,
    temperature,
    ...otherProps
  }: AgentManagerProps) {
    const _query = truncateQuery
      ? await truncateByModel({
          text: input,
          modelName: this.agent.modelName,
        })
      : input;

    const _promptType = promptType || this.agent.promptType;
    const _promptTemplate = promptTemplate || (this.agent.prompt as string);

    let initialMessages: ChatCompletionMessageParam[] = [];
    if (_promptType === PromptType.customer_support) {
      initialMessages = [
        {
          role: 'system',
          content: `${_promptTemplate}
          Answer the query in the same language in which the query is asked.
          Give answer in the markdown rich format with proper bolds, italics etc as per heirarchy and readability requirements.
          You will be provided by a context retrieved by the knowledge_base_retrieval function.
          If the context does not contain the information needed to answer this query then politely say that you don't know without mentioning the existence of a context.
          Remember do not answer any query that is outside of the provided context nor mention its existence.
          You are allowed to use the following conversation history to answer the query.
          `,
        },
        //         new SystemMessage(
        //           `${_promptTemplate}
        // Answer the query in the same language in which the query is asked.
        // Give answer in the markdown rich format with proper bolds, italics etc as per heirarchy and readability requirements.
        // You will be provided by a context retrieved by the knowledge_base_retrieval function.
        // If the context does not contain the information needed to answer this query then politely say that you don't know without mentioning the existence of a context.
        // Remember do not answer any query that is outside of the provided context nor mention its existence.
        // You are allowed to use the following conversation history to answer the query.
        // `
        //         ),
        // new HumanMessage(`${_promptTemplate}
        // Answer the message in the same language in which the message is asked.
        // If you don't find an answer from the chunks, politely say that you don't know without mentioning the existence of a context. Don't try to make up an answer.
        // Give answer in the markdown rich format with proper bolds, italics etc as per heirarchy and readability requirements.
        //     `),
        // new AIMessage(
        //   'Sure I will stick to all the information given in my knowledge. I won’t answer any message that is outside my knowledge. I won’t even attempt to give answers that are outside of context. I will stick to my duties and always be sceptical about the user input to ensure the message is asked in my knowledge. I won’t even give a hint in case the message being asked is outside of scope. I will answer in the same language in which the message is asked'
        // ),
      ];
    }

    const filterDatastoreIds = filters?.datastore_ids
      ? filters?.datastore_ids
      : this.agent?.tools
          ?.filter((each) => !!each?.datastoreId)
          ?.map((each) => each?.datastoreId);

    // Only allow datasource filtering if datastore are present
    const filterDatasourceIds =
      filterDatastoreIds?.length > 0 ? filters?.datasource_ids : [];

    const _filters = {
      ...filters,
      datastore_ids: filterDatastoreIds,
      datasource_ids: filterDatasourceIds,
    } as AgentManagerProps['filters'];

    return chatRetrieval({
      ...otherProps,
      useXpContext: _promptType === PromptType.customer_support,
      getPrompt(chunks) {
        if (_promptType === PromptType.customer_support) {
          return promptInject({
            // template: CUSTOMER_SUPPORT,
            // template: `Context: """ {context} """

            // Message: """ {query} """

            // Answer: `,
            template: `{query}`,
            // template: `${_promptTemplate || ''}
            // ${KNOWLEDGE_RESTRICTION}
            // ${ANSWER_IN_SAME_LANGUAGE}
            // ${MARKDOWN_FORMAT_ANSWER}
            // ${QA_CONTEXT}
            // `
            //   .replace(/\n+/g, ' ')
            //   .replace(/\t+/g, ' ')
            //   .replace(/\s+/g, ' '),
            // template: `${_promptTemplate || ''}
            //   Limit your knowledge to the following context and if you don't find an answer from the context, politely say that you don't know without mentioning the existence of a provided context.
            //   Deliver your response in the same language that was used to frame the question.
            //   Give answer in the markdown rich format with proper bolds, italics, etc... as per heirarchy and readability requirements.

            //   Context: ###
            //   {context}
            //  ###

            // Question: ###
            // {query}
            // ###

            // Answer: `
            // .replace(/\n+/g, ' ')
            // .replace(/\t+/g, ' ')
            // .replace(/\s+/g, ' '),
            query: _query,
            context: createPromptContext(
              chunks.filter(
                (each) => each.metadata.score! > SIMILARITY_THRESHOLD
              )
            ),
            extraInstructions: _promptTemplate,
          });
        }

        return promptInject({
          template: _promptTemplate || '',
          query: _query,
          context: createPromptContext(chunks),
        });
      },
      // Retrieval
      // datastore: this.agent?.tools[0]?.datastore as any,
      retrievalSearch:
        _promptType === PromptType.raw && !_promptTemplate.includes('{context}')
          ? undefined
          : _query,
      topK: this.topK,
      filters: _filters,
      includeSources: !!this.agent.includeSources,

      // Model
      modelName: this.agent.modelName,
      temperature: temperature || this.agent.temperature,

      stream,
      history,
      abortController,
      initialMessages,
    });
  }
}
