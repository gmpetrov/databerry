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
import {
  ChatCompletionCreateParamsBase,
  ChatCompletionTool,
} from 'openai/resources/chat/completions';

import ChatModel from '../chat-model';
import partiallyIncludes from '../partially-includes';
import { SSE_EVENT } from '../types';

import { BlablaSchema } from './blablaform.types';

const defaultSystemPrompt = `You role is to help fill a form that follows a JSON Schema that will be given to you, you should only ask about the field specified in the properties of the schema. You will ask questions in natural language, one at a time, to the user and fill the form. Use a friendly and energetic tone. You are able to go back to previous questions if asked.`;

export class BlaBlaForm {
  schema: BlablaSchema;
  values: object;
  modelName: ChatCompletionCreateParamsBase['model'];
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
    const _systemPrompt = `
${systemPrompt}\n
Use the language specified by ${locale}. 
While optional fields can be omitted by the user, ensure you do not request or accept any information beyond what's defined in the schema.
For each questions, in order to keep track of the current field, finish your sentence with __BLABLA_FIELD__: field name as defined in the schema.

Example with a field named firstname: What is yout firstname __BLABLA_FIELD__: firstname

For reference, the current schema is: ${JSON.stringify(
      this.schema.properties
    )}`;
    this.systemPrompt = _systemPrompt;
    console.log('this.schema.properties', this.schema.properties);
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
    modelName: ChatCompletionCreateParamsBase['model'];
    messages: ChatCompletionMessageParam[];
    handleLLMNewToken?: (token: string) => any;
  }) {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const isStreamEnabled = Boolean(handleLLMNewToken);

    const model = new ChatModel();

    let isValid = false;
    let values = {};

    console.log('messages', JSON.stringify(messages, null, 2));

    const callParams = {
      model: modelName,
      messages,
      tools: [
        {
          type: 'function',
          function: {
            name: 'isFormValid',
            description:
              'Trigger only when all the required field have been answered',
            parameters: schema,
            parse: JSON.parse,
            function: (props: any) => {
              isValid = true;
              values = props;
              // TODO: Save values to the db

              return `Form successfully filled.`;
            },
            // function: (args: any) => {

            // }
          },
        } as ChatCompletionTool,
      ],
    } as ChatCompletionCreateParamsBase;

    if (isStreamEnabled) {
      const needle = '__BLABLA_FIELD__';

      let buffer = '';
      let stop = false;
      const handleStream = (chunk: string, event?: any) => {
        buffer += chunk;

        if (!stop) {
          if (partiallyIncludes(buffer, needle)) {
            if (buffer.includes(needle)) {
              stop = true;
            }
          } else {
            (handleLLMNewToken as any)?.(buffer, event);
            buffer = '';
          }
        }
      };

      const { answer, completion } = await model.call({
        ...callParams,
        // handleStream: handleLLMNewToken,
        handleStream: handleStream,
      });

      // let completion = {} as ChatCompletionMessage;
      let currentField = '';

      const re = /__BLABLA_FIELD__:?\s?(.*)/;
      currentField = answer?.match(re)?.[1]?.trim?.() || '';
      if (!schema?.properties?.[currentField]) {
        console.log('field name not found in schema: ', currentField);
        currentField = '';
      }

      console.log('currentField', currentField);

      if (currentField || isValid) {
        (handleLLMNewToken as any)?.(
          JSON.stringify({ currentField, isValid }),
          SSE_EVENT.metadata
        );
      }

      return {
        answer: answer?.replace(re, ''),
        isValid,
        values,
        metadata: {
          currentField,
        },
      };
    } else {
      const { answer, completion } = await model.call({
        ...callParams,
        handleStream: handleLLMNewToken,
      });

      const fn = completion?.choices?.[0]?.message?.tool_calls?.[0]?.function;
      const isValid = fn?.name === 'isFormValid';
      const values = fn?.arguments ? JSON.parse(fn?.arguments!) : undefined;

      return {
        answer,
        isValid,
        values,
        metadata: {},
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

    const { answer, isValid, values, metadata } = await BlaBlaForm.blabla({
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
      metadata,
    };
  }
}
