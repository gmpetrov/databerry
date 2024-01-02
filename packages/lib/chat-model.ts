import OpenAI, { ClientOptions } from 'openai';
import { RunnableToolFunction } from 'openai/lib/RunnableFunction';
import { CompletionUsage } from 'openai/resources';
import pRetry from 'p-retry';

import { countTokensEstimation } from './count-tokens';
import failedAttemptHandler from './lc-failed-attempt-hanlder';
import { promptTokensEstimate } from './tokens-estimate';
import { SSE_EVENT } from './types';

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

  async call({
    handleStream,
    signal,
    tools = [],
    ...otherProps
  }: Parameters<typeof this.openai.chat.completions.create>[0] & {
    handleStream?: (text: string, event?: SSE_EVENT) => any;
    signal?: AbortSignal;
  }) {
    return pRetry(
      async () => {
        let usage: CompletionUsage = {
          completion_tokens: 0,
          prompt_tokens: promptTokensEstimate({
            tools,
            useFastApproximation: true,
            tool_choice: otherProps?.tool_choice,
            messages: otherProps?.messages,
            functions: otherProps?.functions,
            function_call: otherProps?.function_call,
          }),
          total_tokens: 0,
        };

        if (tools?.length > 0) {
          const runner = await this.openai.beta.chat.completions
            .runTools({
              ...otherProps,

              tools: tools as any,
              stream: true,
            })
            .on('message', (msg) => {
              console.log('msg', msg);
            })
            .on('functionCall', (functionCall) => {
              console.log('functionCall', functionCall);
              handleStream?.(
                JSON.stringify({
                  type: 'function',
                  name: functionCall?.name,
                  arguments: functionCall?.arguments,
                }),
                SSE_EVENT.tool_call
              );
            })
            .on('functionCallResult', (functionCallResult) =>
              console.log('functionCallResult', functionCallResult)
            )
            .on('content', (chunk) => {
              handleStream?.(chunk);
            });

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

              usage.completion_tokens += countTokensEstimation({
                text: content || '',
              });
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

            usage.completion_tokens = countTokensEstimation({
              text: response?.choices?.[0]?.message?.content || '',
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
