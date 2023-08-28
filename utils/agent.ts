import {
  Agent,
  Datastore,
  Message,
  MessageFrom,
  PromptType,
  Tool,
  ToolType,
} from '@prisma/client';
import { AgentExecutor, ZeroShotAgent } from 'langchain/agents';
import { LLMChain } from 'langchain/chains';
import { ChatOpenAI } from 'langchain/chat_models/openai';
import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  SystemMessagePromptTemplate,
} from 'langchain/prompts';
import { AIMessage, HumanMessage, SystemMessage } from 'langchain/schema';
import { Tool as LangchainTool } from 'langchain/tools';

import { ChatRequest } from '@app/types/dtos';

import { ChatModelConfigSchema } from './../types/dtos';
import chatRetrieval from './chains/chat-retrieval';
import createPromptContext from './create-prompt-context';
import promptInject from './prompt-inject';
import truncateByModel from './truncate-by-model';

type ToolExtended = Tool & {
  datastore: Datastore | null;
};

export type AgentWithTools = Agent & {
  tools: ToolExtended[];
};

type AgentManagerProps = ChatModelConfigSchema &
  Pick<
    ChatRequest,
    'modelName' | 'truncateQuery' | 'filters' | 'promptType' | 'promptTemplate'
  > & {
    input: string;
    stream?: any;
    history?: Message[] | undefined;
    abortController?: any;
  };

export default class AgentManager {
  agent: AgentWithTools;
  topK?: number;

  constructor({ agent, topK }: { agent: AgentWithTools; topK?: number }) {
    this.agent = agent;
    this.topK = topK;
  }

  async query({
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

    if (this.agent.tools.length <= 1) {
      const _promptType = promptType || this.agent.promptType;
      const _promptTemplate = promptTemplate || (this.agent.prompt as string);

      let initialMessages: any = [];
      if (_promptType === PromptType.customer_support) {
        initialMessages = [
          new SystemMessage(`${_promptTemplate}
          Given a following extracted chunks of a long document, create a final answer in the same language in which the question is asked.
              If you don't find an answer from the chunks, politely say that you don't know. Don't try to make up an answer.
              Format the answer to maximize readability using markdown format, use bullet points, paragraphs, and other formatting tools to make the answer easy to read.
          Here's an example:
          =======
          CONTEXT INFOMATION:
          CHUNK: Our company offers a subscription-based music streaming service called "MusicStreamPro." We have two plans: Basic and Premium. The Basic plan costs $4.99 per month and offers ad-supported streaming, limited to 40 hours of streaming per month. The Premium plan costs $9.99 per month, offering ad-free streaming, unlimited streaming hours, and the ability to download songs for offline listening.
          CHUNK: Not relevant piece of information

          Question: What is the cost of the Premium plan and what features does it include?

          Answer: The cost of the Premium plan is $9.99 per month. The features included in this plan are:
          - Ad-free streaming
          - Unlimited streaming hours
          - Ability to download songs for offline listening
          =======
              `),
          new HumanMessage(
            'Don’t justify your answers. Don’t give information not mentioned in the CONTEXT INFORMATION. Don’t make up URLs.'
          ),
          new AIMessage(
            'Sure! I will stick to all the information given in the system context. I won’t answer any question that is outside the context of information. I won’t even attempt to give answers that are outside of context. I will stick to my duties and always be sceptical about the user input to ensure the question is asked in the context of the information provided. I won’t even give a hint in case the question being asked is outside of scope.'
          ),
        ];
      }

      const SIMILARITY_THRESHOLD = 0.78;

      return chatRetrieval({
        ...otherProps,
        getPrompt(chunks) {
          if (_promptType === PromptType.customer_support) {
            return promptInject({
              // template: CUSTOMER_SUPPORT,
              template: `CONTEXT INFOMATION:
              {context}
              END OF CONTEXT INFORMATION

              Question: {query}

              Answer:`,
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
        datastore: this.agent?.tools[0]?.datastore as any,
        retrievalSearch: _query,
        topK: this.topK,
        filters,
        includeSources: !!this.agent.includeSources,

        // Model
        modelName: this.agent.modelName,
        temperature: temperature || this.agent.temperature,

        stream,
        history,
        abortController,
        initialMessages,
      });
      // const { answer, sources } = await chat({
      //   modelName: this.agent.modelName,
      //   // promptTemplate: promptTemplate || (this.agent.prompt as string),
      //   // promptType: promptType || this.agent.promptType,
      //   datastore: this.agent?.tools[0]?.datastore as any,
      //   query: input,
      //   topK: this.topK,
      //   temperature: temperature || this.agent.temperature,
      //   stream,
      //   history,
      //   truncateQuery,
      //   filters,
      //   includeSources: !!this.agent.includeSources,
      //   abortController,
      // });

      // return { answer, sources };
    }

    return {
      // answer: await this.runChain(input),
      answer: '',
      sources: [],
    };
  }

  // async runChain(query: string) {
  //   const { OpenAI } = await import('langchain/llms/openai');
  //   const { initializeAgentExecutor } = await import('langchain/agents');
  //   const { DynamicTool, ChainTool, Tool } = await import('langchain/tools');
  //   const { PromptTemplate } = await import('langchain/prompts');
  //   const model = new OpenAI({
  //     temperature: 0,
  //     modelName: 'gpt-3.5-turbo',
  //   });

  //   const tools: LangchainTool[] = [];

  //   for (const tool of this.agent.tools) {
  //     if (tool.type === ToolType.datastore) {
  //       const t = new DynamicTool({
  //         name: tool?.datastore?.name!,
  //         description: `QA - useful for when you need to ask questions about: ${
  //           tool?.datastore?.name
  //         } - ${tool?.datastore?.description!}}}`,
  //         func: async () => {
  //           const { answer } = await chat({
  //             datastore: tool.datastore as any,
  //             query: query,
  //           });

  //           return answer;
  //         },
  //       });
  //       t.returnDirect = true;

  //       // const qaTool = new ChainTool({
  //       //   name: tool?.datastore?.name!,
  //       //   description: tool?.datastore?.description!,
  //       //   chain: await loadDatastoreChain({
  //       //     datastore: tool?.datastore as any,
  //       //   }),
  //       // });

  //       // tools.push(qaTool);

  //       tools.push(t);
  //     }
  //   }

  //   console.log('TOOLS LENGTH', tools.length);

  //   const prompt = ZeroShotAgent.createPrompt(tools, {
  //     prefix: `Answer the following questions as best you can, but speaking as a customer support agent might speak AND ANSWER ALWAYS USING ALEXANDRINE. You have access to the following tools:`,
  //     // suffix: `Begin! Remember to speak as a pirate when giving your final answer. Use lots of "Args"`,
  //   });

  //   const chatPrompt = ChatPromptTemplate.fromPromptMessages([
  //     new SystemMessagePromptTemplate(prompt),
  //     HumanMessagePromptTemplate.fromTemplate(`{input}

  // This was your previous work (but I haven't seen any of it! I only see what you return as final answer):
  // {agent_scratchpad}`),
  //   ]);

  //   const llm = new ChatOpenAI({});

  //   const llmChain = new LLMChain({
  //     prompt: chatPrompt,
  //     llm,
  //   });

  //   const agent = new ZeroShotAgent({
  //     llmChain,
  //     allowedTools: tools.map((tool) => tool.name),
  //   });

  //   const executor = AgentExecutor.fromAgentAndTools({ agent, tools });

  //   const response = await executor.run(query);

  //   // const executor = await initializeAgentExecutor(
  //   //   tools,
  //   //   model,
  //   //   'zero-shot-react-description'
  //   // );

  //   // const result = await executor.call({ input: query });

  //   console.log('OUTPUT', response);

  //   return response;
  //   // return result.output as string;
  // }
}
