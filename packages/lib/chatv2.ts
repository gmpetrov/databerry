import { ChatOpenAI } from 'langchain/chat_models/openai';
import { AIMessage, BaseMessage, HumanMessage } from 'langchain/schema';

import { AgentModelName, Message, MessageFrom } from '@chaindesk/prisma';

import { ChatModelConfigSchema, ChatResponse } from './types/dtos';
import { ModelConfig } from './config';
import truncateChatMessages from './truncateChatMessages';

export type ChatProps = ChatModelConfigSchema & {
  prompt: string;
  stream?: any;
  modelName?: AgentModelName;
  history?: Message[];
  abortController?: any;
  initialMessages?: BaseMessage[] | undefined;
};

const chat = async ({
  prompt,
  stream,
  temperature,
  history,
  initialMessages = [],
  modelName = AgentModelName.gpt_3_5_turbo,
  abortController,
  ...otherProps
}: ChatProps) => {
  let totalCompletionTokens = 0;
  let totalPromptTokens = 0;
  let totalExecutionTokens = 0;

  const model = new ChatOpenAI({
    streaming: Boolean(stream),
    modelName: ModelConfig[modelName]?.name,

    temperature: temperature || 0,
    topP: otherProps.topP,
    frequencyPenalty: otherProps.frequencyPenalty,
    presencePenalty: otherProps.presencePenalty,
    maxTokens: otherProps.maxTokens,
    callbacks: [
      {
        handleLLMNewToken: stream,
        handleLLMEnd: (output, runId, parentRunId?, tags?) => {
          const { completionTokens, promptTokens, totalTokens } =
            output.llmOutput?.tokenUsage ||
            output.llmOutput?.estimatedTokenUsage;
          totalCompletionTokens += completionTokens ?? 0;
          totalPromptTokens += promptTokens ?? 0;
          totalExecutionTokens += totalTokens ?? 0;
        },
        handleLLMError: async (err: Error) => {
          console.error('handleLLMError', err);
        },
      },
    ],
  });

  if (process.env.APP_ENV === 'test') {
    model.call = async (props: any) => {
      const res = {
        text: 'Hello world',
      } as any;

      if (stream) {
        stream(res.text);
      }

      return res;
    };
  }

  const truncatedHistory = (
    await truncateChatMessages({
      messages: (history || [])
        ?.map((each) => {
          if (each.from === MessageFrom.human) {
            return new HumanMessage(each.text);
          }
          return new AIMessage(each.text);
        })
        .reverse(),
      maxTokens: ModelConfig[modelName]?.maxTokens * 0.3, // 30% tokens limit for history
    })
  ).reverse();

  const messages = [
    ...initialMessages,
    ...truncatedHistory,
    new HumanMessage(prompt),
  ];

  const output = await model.call(messages, {
    signal: abortController?.signal,
  });

  const answer = (output?.content as string)?.trim?.();

  const usage = {
    completionTokens: totalCompletionTokens,
    promptTokens: totalPromptTokens,
    totalTokens: totalExecutionTokens,
    cost:
      totalPromptTokens * ModelConfig[modelName]?.providerPriceByInputToken +
      totalCompletionTokens *
        ModelConfig[modelName]?.providerPricePriceByOutputToken,
  };

  return {
    answer,
    usage,
    sources: [] as any,
  } as ChatResponse;
};

export default chat;
