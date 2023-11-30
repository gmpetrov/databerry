import OpenAI, { ClientOptions } from 'openai';
import { RunnableToolFunction } from 'openai/lib/RunnableFunction';
import {
  ChatCompletionMessageParam,
  ChatCompletionTool,
  CompletionUsage,
} from 'openai/resources';
import pRetry from 'p-retry';

import failedAttemptHandler from './lc-failed-attempt-hanlder';

const list = () => ['mistery'];

const tools = [
  {
    type: 'function',
    function: {
      name: 'list',
      description:
        'list queries books by genre, and returns a list of names of books',
      parameters: {
        type: 'object',
        properties: {
          genre: {
            type: 'string',
            enum: ['mystery', 'nonfiction', 'memoir', 'romance', 'historical'],
          },
        },
      },
      function: list,
      parse: JSON.parse,
    },
  } as RunnableToolFunction<{ genre: string }>,
];

export default class ChatModel {
  public openai: OpenAI;

  constructor(options?: ClientOptions) {
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
    tools = [],
    ...otherProps
  }: Parameters<typeof this.openai.chat.completions.create>[0] & {
    handleStream?: (text: string) => any;
    signal?: AbortSignal;
  }) {
    return pRetry(
      async () => {
        let usage: CompletionUsage = {
          completion_tokens: 0,
          prompt_tokens: ChatModel.countTokensMessages(otherProps?.messages),
          total_tokens: 0,
        };

        if (tools?.length > 0) {
          const runner = await this.openai.beta.chat.completions
            .runTools({
              ...otherProps,

              tools: tools as any,
              stream: true,
            })
            .on('message', (msg) => console.log('msg', msg))
            .on('functionCall', (functionCall) =>
              console.log('functionCall', functionCall)
            )
            .on('functionCallResult', (functionCallResult) =>
              console.log('functionCallResult', functionCallResult)
            )
            .on('content', (diff) => console.log('content', diff));

          const completion = await runner.finalChatCompletion();

          usage.total_tokens = usage.prompt_tokens + usage.completion_tokens;

          return {
            answer: completion?.choices?.[0]?.message?.content?.trim?.(),
            usage,
            completion,
          };
        } else {
          if (!!handleStream) {
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

            usage.total_tokens = usage.prompt_tokens + usage.completion_tokens;

            return {
              answer: response?.choices?.[0]?.message?.content?.trim?.(),
              usage: response?.usage,
              completion: response,
            };
          }
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
