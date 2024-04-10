import OpenAI, { ClientOptions } from 'openai';
import { RunnableToolFunction } from 'openai/lib/RunnableFunction';
import { CompletionUsage } from 'openai/resources';
import pRetry from 'p-retry';

import { countTokensEstimation } from './count-tokens';
import failedAttemptHandler from './lc-failed-attempt-hanlder';
import { promptTokensEstimate } from './tokens-estimate';
import { SSE_EVENT } from './types';

export default class ChatModel {
  public openai: OpenAI;

  constructor(options?: ClientOptions) {
    this.openai = new OpenAI({
      ...options,
      defaultHeaders: {
        'HTTP-Referer': 'https://www.chaindesk.ai/', // Optional, for including your app on openrouter.ai rankings.
        'X-Title': 'Chaindesk', // Optional. Shows in rankings on openrouter.ai.
        ...options?.defaultHeaders,
      },
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
          // let fallbackContent = '';
          const runner = await this.openai.beta.chat.completions
            .runTools({
              ...otherProps,

              tools: tools as any,
              stream: true,
            })
            .on('message', (msg) => {
              console.log('msg', JSON.stringify(msg, null, 2));
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
              // fallbackContent += chunk;
              handleStream?.(chunk);
            });

          const completion = await runner.finalChatCompletion();
          // .catch(async (err) => {
          //   if (
          //     fallbackContent?.includes('function') &&
          //     fallbackContent?.includes('parameters')
          //   ) {
          //     return handleToolFallFallback({ output: fallbackContent });
          //   }

          //   // Fallback to original error
          //   throw err;
          // });

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

// const handleToolFallFallback = async (props: { output: string }) => {
//   // Model without native tool support
//   // Fallback to manual tool execution if possible otherwise throw original error
//   try {
//     const payload = JSON.parse(props.output) as {
//       function: string;
//       parameters: any;
//     };

//     console.log('[TOOL_CALLING_FALLBACK]: Payload', payload);

//     const tool = tools.find(
//       (tool) => tool.function.name === payload.function
//     );

//     if (tool) {
//       const params = (tool.function as any).parse?.(
//         JSON.stringify(payload.parameters)
//       );

//       console.log('[TOOL_CALLING_FALLBACK]: Validated Parameters', params);

//       // Notify UI about tool execution
//       handleStream?.(
//         JSON.stringify({
//           type: 'function',
//           name: payload?.function,
//           arguments: payload?.parameters,
//         }),
//         SSE_EVENT.tool_call
//       );

//       const toolResult = await (tool.function as any).function(params);

//       const response = await this.openai.chat.completions.create({
//         ...otherProps,
//         messages: [
//           ...otherProps.messages,
//           {
//             role: 'function',
//             name: payload.function,
//             content: JSON.stringify(toolResult),
//           },
//         ],
//         stream: false,
//       });

//       handleStream?.(
//         response?.choices?.[0]?.message?.content?.trim?.() || ''
//       );

//       return response;
//     }
//   } catch {}
// };
