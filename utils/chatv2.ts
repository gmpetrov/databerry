import { AgentModelName, Message, MessageFrom } from '@prisma/client';
import { ChatOpenAI } from 'langchain/chat_models/openai';
import { AIMessage, BaseMessage, HumanMessage } from 'langchain/schema';

import { ChatModelConfigSchema, ChatResponse } from '@app/types/dtos';

import { ModelConfig } from './config';

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

  const prevMessages = (history || [])?.map((each) => {
    if (each.from === MessageFrom.human) {
      return new HumanMessage(each.text);
    }
    return new AIMessage(each.text);
  });

  const messages = [
    ...initialMessages,
    ...prevMessages,
    new HumanMessage(prompt),
  ];

  const output = await model.call(messages, {
    signal: abortController?.signal,
  });

  const answer = output?.content.trim?.();

  return {
    answer,
    sources: [] as any,
  } as ChatResponse;
};

export default chat;
