/*
    package that allows to create conversational forms with Generative AI
    input json schema -> AI ask questions until form is valid -> output json
*/
import { JSONSchema7 } from 'json-schema';
import OpenAI from 'openai';
import {
  ChatCompletionChunk,
  ChatCompletionMessage,
  ChatCompletionMessageParam,
} from 'openai/resources/chat';

import { BlablaSchema } from './blablaform.types';

const defaultSystemPrompt = `You role is to help fill a form that follows a JSON Schema that will be given to you, you should only ask about the field specified in the properties of the schema. You will ask questions in natural language, one at a time, to the user and fill the form. Use a friendly and energetic tone. You are able to go back to previous questions if asked.`;

function messageReducer(
  previous: ChatCompletionMessage,
  item: ChatCompletionChunk
): ChatCompletionMessage {
  const reduce = (acc: any, delta: any) => {
    acc = { ...acc };
    for (const [key, value] of Object.entries(delta)) {
      if (acc[key] === undefined || acc[key] === null) {
        acc[key] = value;
      } else if (typeof acc[key] === 'string' && typeof value === 'string') {
        (acc[key] as string) += value;
      } else if (typeof acc[key] === 'object' && !Array.isArray(acc[key])) {
        acc[key] = reduce(acc[key], value);
      }
    }
    return acc;
  };

  return reduce(previous, item.choices[0]!.delta) as ChatCompletionMessage;
}

const handleValidForm = (formValues: Record<string, unknown>) => {
  return formValues;
};

async function callFunction(
  function_call: ChatCompletionMessage.FunctionCall
): Promise<any> {
  const args = JSON.parse(function_call.arguments!);
  switch (function_call.name) {
    case 'isFormValid':
      // TODO: save values to the db and send an email
      return await handleValidForm(args);
    default:
      throw new Error('No function found');
  }
}

export class BlaBlaForm {
  schema: BlablaSchema;
  values: object;
  modelName: string;
  messages: ChatCompletionMessageParam[];
  systemPrompt?: string;
  locale?: string;
  handleLLMNewToken?: (token: string) => any;

  constructor({
    schema,
    values = {},
    modelName = 'gpt-3.5-turbo',
    messages = [],
    systemPrompt = defaultSystemPrompt,
    locale = 'en',
    handleLLMNewToken,
  }: {
    schema: BlablaSchema;
    values?: Record<string, unknown>;
    modelName?: string;
    messages?: ChatCompletionMessageParam[];
    systemPrompt?: string;
    locale?: string;
    handleLLMNewToken?: (token: string) => any;
  }) {
    this.schema = schema;
    this.values = values;
    this.modelName = modelName;
    this.locale = locale;
    this.handleLLMNewToken = handleLLMNewToken;
    const _systemPrompt = `${systemPrompt}\nUsing the language specified by ${locale}, then please retrieve only the information outlined in ${this.schema.properties}. While optional fields can be omitted by the user, ensure you do not request or accept any information beyond what's defined in the schema. For reference, the current schema is: ${this.schema.properties} `;
    this.systemPrompt = _systemPrompt;
    this.messages = [
      {
        role: 'system',
        content: _systemPrompt,
      },
      ...messages,
    ];
  }

  static async blabla({
    schema,
    modelName,
    messages,
    handleLLMNewToken,
  }: {
    schema: BlablaSchema;
    modelName: string;
    messages: ChatCompletionMessageParam[];
    handleLLMNewToken?: (token: string) => any;
  }) {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const isStreamEnabled = Boolean(handleLLMNewToken);

    if (isStreamEnabled) {
      const stream = await openai.chat.completions.create({
        model: modelName,
        messages,
        stream: true,
        functions: [
          {
            name: 'isFormValid',
            description:
              'Trigger only when all the required field have been answered',
            parameters: schema,
          },
          // {
          //   name: 'getFormValues',
          //   description:
          //     'Use this function to extract values from the conversation along with the completion',
          //   parameters: schema,
          // },
        ],
      });

      let completion = {} as ChatCompletionMessage;
      let hasStreamedOnce = false;
      const TOKEN_SEPERATOR = '__BLABLA_FIELD_ID__:';
      const generateOrderedCombinations = (
        str: string,
        index = 1
      ): string[] => {
        if (index > str.length) return [];
        return [str.substring(0, index)].concat(
          generateOrderedCombinations(str, index + 1)
        );
      };
      const potentialStarts = generateOrderedCombinations(TOKEN_SEPERATOR);
      const pattern = /__BLABLA_FIELD_ID__:[a-z][a-zA-Z0-9]{24}/g;

      let currentFieldId = '';

      let buffer = '';
      for await (const chunk of stream) {
        completion = messageReducer(completion, chunk);

        if (completion.function_call) {
          if (!hasStreamedOnce) {
            hasStreamedOnce = true;
          }
        } else {
          const content = chunk?.choices?.[0]?.delta?.content!;
          buffer += content;
          // let shouldStream = true;

          // const match = buffer.match(pattern);

          // if (match) {
          //   currentFieldId = match[0];
          //   // remove pattern from the buffer
          //   buffer = buffer.replace(pattern, '');
          // } else {
          //   for (const start of potentialStarts) {
          //     if (buffer.endsWith(start)) {
          //       shouldStream = false;
          //       break;
          //     }
          //   }
          // }

          // if (shouldStream) {
          handleLLMNewToken?.(content);
          buffer = '';
          // buffer = '';
          // }
        }
      }

      if (completion?.function_call?.name === 'isFormValid') {
        const values = JSON.parse(completion?.function_call.arguments!);
        handleLLMNewToken?.(
          'You have successfully filled the form. Thank you for your time'
        );
        return {
          answer:
            'You have successfully filled the form. Thank you for your time',
          isValid: true,
          values,
        };
      }

      console.log('-------------------------', currentFieldId);
      return {
        answer: completion.content,
        isValid: false,
        values: undefined,
        currentFieldId,
      };
    } else {
      const completion = await openai.chat.completions.create({
        model: modelName,
        messages,
        stream: false,
        functions: [
          {
            name: 'isFormValid',
            description:
              'Trigger only when all the required field have been answered',
            parameters: schema,
          },
          // {
          //   name: 'getFormValues',
          //   description:
          //     'Use this function to extract values from the conversation along with the completion',
          //   parameters: schema,
          // },
        ],
      });
      const message = completion?.choices?.[0]?.message;

      return {
        answer: message,
        isValid:
          (completion as any)?.choices[0].message?.function_call?.name ===
          'isFormValid',
        values:
          (completion as any)?.choices[0].message?.function_call?.name ===
          'getFormValues'
            ? JSON.parse(
                (completion as any)?.choices[0].message?.function_call
                  ?.arguments!
              )
            : undefined,
      };
    }
  }

  async run(query?: string) {
    if (query) {
      this.messages.push({
        role: 'user',
        content: query,
      });
    }

    const { answer, isValid, values } = await BlaBlaForm.blabla({
      schema: this.schema,
      messages: this.messages,
      modelName: this.modelName,
      handleLLMNewToken: this.handleLLMNewToken,
    });

    this.messages.push({
      role: 'assistant',
      content: answer as string,
    });

    return {
      answer,
      isValid,
      values,
    };
  }
}
