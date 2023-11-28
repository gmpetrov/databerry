import OpenAI, { ClientOptions } from 'openai';
import { ChatCompletionMessageParam, CompletionUsage } from 'openai/resources';
import pRetry from 'p-retry';

import failedAttemptHandler from './lc-failed-attempt-hanlder';

export default class ChatModel {
  public openai: OpenAI;

  constructor(options: ClientOptions) {
    this.openai = new OpenAI({
      ...options,
    });
  }

  static countTokensMessages(messages: ChatCompletionMessageParam[]) {
    let counter = 0;

    for (const each of messages) {
      counter += each?.content?.length || 0;
    }

    return counter / 4;
  }

  async call({
    handleStream,
    signal,
    ...otherProps
  }: Parameters<typeof this.openai.chat.completions.create>[0] & {
    handleStream?: (text: string) => any;
    signal?: AbortSignal;
  }) {
    return pRetry(
      async () => {
        if (!!handleStream) {
          let usage: CompletionUsage = {
            completion_tokens: 0,
            prompt_tokens: ChatModel.countTokensMessages(otherProps?.messages),
            total_tokens: 0,
          };

          const streaming = await this.openai.chat.completions.create({
            ...otherProps,
            stream: true,
          });

          let buffer = '';
          for await (const chunk of streaming) {
            const content = chunk.choices[0]?.delta?.content || '';

            handleStream?.(content);
            buffer += content;
            usage.completion_tokens += 1;
          }

          usage.total_tokens = usage.prompt_tokens + usage.completion_tokens;

          return {
            answer: buffer?.trim?.(),
            usage,
          };
        } else {
          const response = await this.openai.chat.completions.create({
            ...otherProps,
            stream: false,
          });

          return {
            answer: response?.choices?.[0]?.message?.content?.trim?.(),
            usage: response?.usage,
          };
        }
      },
      {
        signal,
        retries: 6,
        onFailedAttempt: failedAttemptHandler,
      }
    );
  }
}
