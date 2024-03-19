import axios, { AxiosRequestConfig } from 'axios';

import { ModelConfig } from '@chaindesk/lib/config';
import { countTokensEstimation } from '@chaindesk/lib/count-tokens';
import createToolParser from '@chaindesk/lib/create-tool-parser';
import splitTextIntoChunks from '@chaindesk/lib/split-text-by-token';
import { HttpToolSchema, ToolSchema } from '@chaindesk/lib/types/dtos';
import { AgentModelName } from '@chaindesk/prisma';

import { CreateToolHandlerConfig, HttpToolResponseSchema } from './type';

export type HttpToolPayload = {
  [key: string]: unknown;
};

export const toJsonSchema = (tool: HttpToolSchema) => {
  return {
    name: `${tool.id}`,
    description: tool?.config?.description,

    parameters: {
      type: 'object',
      properties: {
        ...tool?.config?.headers
          ?.filter((tool) => !!tool.isUserProvided)
          ?.map((tool) => ({
            [tool.key]: {
              type: 'string',
            },
          }))
          .reduce((acc, curr) => ({ ...acc, ...curr }), {}),
        ...tool?.config?.body
          ?.filter((tool) => !!tool.isUserProvided)
          ?.map((tool) => ({
            [tool.key]: {
              type: 'string',
            },
          }))
          .reduce((acc, curr) => ({ ...acc, ...curr }), {}),
        ...tool?.config?.queryParameters
          ?.filter((tool) => !!tool.isUserProvided)
          ?.map((tool) => ({
            [tool.key]: {
              type: 'string',
            },
          }))
          .reduce((acc, curr) => ({ ...acc, ...curr }), {}),
      },
      required: [],
    },
  };
};

export const createHandler =
  (
    httpTool: HttpToolSchema,
    toolHandlerConfig?: CreateToolHandlerConfig<{ type: 'http' }>
  ) =>
  async (payload: HttpToolPayload): Promise<HttpToolResponseSchema> => {
    const config = httpTool?.config;

    if (config?.withApproval) {
      return {
        approvalRequired: true,
      };
    }

    const inputUrl = new URL(config.url);
    const inputQUeryParams = new URLSearchParams(inputUrl.search);

    // ?.filter((each) => !each.isUserProvided)
    config?.queryParameters?.forEach((each) => {
      if (each.value) {
        inputQUeryParams.set(each.key, each.value);
      } else if (payload?.[each?.key]) {
        inputQUeryParams.set(each.key, `${payload?.[each?.key]}`);
      }
    });

    const url = `${inputUrl.origin}${
      inputUrl.pathname
    }?${inputQUeryParams.toString()}`;

    console.log('HTTP Tool URL', url);

    const headers: AxiosRequestConfig['headers'] = {
      ...config?.headers
        ?.filter((each) => !each.isUserProvided)
        .reduce((acc, curr) => ({ ...acc, [curr.key]: curr.value }), {}),
      ...config?.headers
        ?.filter((each) => !!each.isUserProvided)
        .reduce((acc, curr) => ({ ...acc, [curr.key]: payload[curr.key] }), {}),
    };

    const reqData: AxiosRequestConfig['data'] = {
      ...config?.body
        ?.filter((each) => !each.isUserProvided)
        .reduce((acc, curr) => ({ ...acc, [curr.key]: curr.value }), {}),
      ...config?.body
        ?.filter((each) => !!each.isUserProvided)
        .reduce((acc, curr) => ({ ...acc, [curr.key]: payload[curr.key] }), {}),
    };

    const reqConfig: AxiosRequestConfig = {
      method: config?.method,
      headers: Object.keys(headers).length > 0 ? headers : undefined,
      data: Object.keys(reqData).length > 0 ? reqData : undefined,
    };

    console.log('HTTP Tool Req', {
      url,
      ...reqConfig,
    });

    try {
      const { data } = await axios(url, reqConfig);
      const MAX_TOKENS =
        ModelConfig[
          toolHandlerConfig?.modelName || AgentModelName.gpt_3_5_turbo_16k
        ].maxTokens * 0.7;

      const totalTokens = countTokensEstimation({ text: data.toString() });

      let chunkedText = data;
      if (totalTokens > MAX_TOKENS) {
        const chunks = await splitTextIntoChunks({
          text: data.toString(),
          chunkSize: MAX_TOKENS,
        });

        chunkedText = chunks[0];
      }

      return { data: chunkedText };
    } catch (err) {
      console.log('HTTP Tool Error', err);
      return {
        data: 'The Http tool has failed. you need to answer the user query based on the general knowledge of chatgpt. make sure to give an approriate answer that would satisfy the user as if the tool did not fail, if you can not fulfil the user request, inform him that the call has failed and to try again later.',
      };
    }
  };

export const createParser =
  (tool: HttpToolSchema, config: any) => (payload: string) => {
    try {
      return createToolParser(toJsonSchema(tool)?.parameters)(payload);
    } catch (err) {
      console.log('Parser Error', err);
      throw err;
    }
  };
