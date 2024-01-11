import { ChatCompletionMessageParam } from 'openai/resources';

import { AgentModelName, Message, MessageFrom } from '@chaindesk/prisma';

import { ChatModelConfigSchema, ChatResponse } from './types/dtos';
import ChatModel from './chat-model';
import { ModelConfig } from './config';
import formatMessagesOpenAI from './format-messages-openai';
import getUsageCost from './get-usage-cost';
import truncateChatMessages from './truncateChatMessages';

export type ChatProps = ChatModelConfigSchema & {
  prompt: string;
  stream?: any;
  modelName?: AgentModelName;
  history?: Message[];
  abortController?: any;
  initialMessages?: ChatCompletionMessageParam[] | undefined;
  context?: string;
  useXpContext?: boolean;
};

const chat = async ({
  prompt,
  stream,
  temperature,
  history,
  initialMessages = [],
  modelName = AgentModelName.gpt_3_5_turbo,
  abortController,
  context,
  useXpContext,
  ...otherProps
}: ChatProps) => {
  const truncatedHistory = (
    await truncateChatMessages({
      messages: formatMessagesOpenAI(history || []).reverse(),
      maxTokens: ModelConfig[modelName]?.maxTokens * 0.3, // 30% tokens limit for history
    })
  ).reverse();

  const messages: ChatCompletionMessageParam[] = [
    ...initialMessages,
    ...truncatedHistory,
    ...((useXpContext && context
      ? [
          {
            role: 'function',
            content: context!,
            name: 'knowledge_base_retrieval',
          },
        ]
      : []) as ChatCompletionMessageParam[]),
    { role: 'user', content: prompt },
  ];

  const model = new ChatModel({});

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
    sources: [] as any,
  } as ChatResponse;
};

export default chat;
