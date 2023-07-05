import { Agent, Datastore } from '@prisma/client';
import { WebClient } from '@slack/web-api';

import { AgentWithTools } from './agent';
import chat from './chat';
import summarize from './summarize';

const slackAgent = async ({
  input,
  agent,
  client,
  channel,
  ts,
}: {
  input: string;
  agent: AgentWithTools;
  channel: string;
  client: WebClient;
  ts: string;
}) => {
  const { AnalyzeDocumentChain, loadSummarizationChain } = await import(
    'langchain/chains'
  );
  const { OpenAI } = await import('langchain/llms/openai');
  const { initializeAgentExecutor } = await import('langchain/agents');
  const { DynamicTool, ChainTool } = await import('langchain/tools');
  const { PromptTemplate } = await import('langchain/prompts');
  const model = new OpenAI({ temperature: 0, modelName: 'gpt-3.5-turbo' });

  // const qaTool = new DynamicTool({
  //   name: datastore?.name!,
  //   description: `${datastore?.name!} QA - useful for when you need to ask questions about: ${
  //     datastore?.description! || datastore?.name
  //   }}}`,
  //   func: async () => {
  //     const { answer } = await chat({
  //       datastore: datastore as any,
  //       query: input,
  //     });

  //     return answer;
  //   },
  // });
  // qaTool.returnDirect = true;

  const template = `Write a concise summary of the following based on this instruction ${input}:


  "{text}"
  
  
  CONCISE SUMMARY:`;

  const prompt = new PromptTemplate({
    template,
    inputVariables: ['text'],
  });

  const summaryTool = new DynamicTool({
    name: 'Summary',
    description: 'call this to perform a summary',
    func: async () => {
      const response = await client.conversations.history({
        channel: channel,
        limit: 100,
      });

      const messages = response.messages
        ?.reverse()
        .filter((each) => each.ts !== ts && !each?.bot_id);

      console.log('messages', messages);

      const text =
        messages?.map((message) => `Message: ${message.text}`).join('\n\n') ||
        'EMPTY';

      return summarize({ text, prompt })?.then((res) => res.answer || '');
    },
  });

  summaryTool.returnDirect = true;

  const tools = [
    summaryTool,
    // qaTool
  ];

  const executor = await initializeAgentExecutor(
    tools,
    model,
    'zero-shot-react-description'
  );

  const result = await executor.call({ input });

  return {
    answer: result.output,
  };
};

export default slackAgent;
