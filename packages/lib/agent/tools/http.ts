import axios, { Axios, AxiosRequestConfig } from 'axios';

// import { jsonSchemaToZod } from 'json-schema-to-zod';
// import z from 'zod';
import createToolParser from '@chaindesk/lib/create-tool-parser';
import { HttpToolSchema } from '@chaindesk/lib/types/dtos';

import { CreateToolHandler, ToolToJsonSchema } from './type';

export type HttpToolPayload = {
  [key: string]: unknown;
};

export const toJsonSchema = ((tool: HttpToolSchema) => {
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
}) as ToolToJsonSchema;

export const createHandler = ((httpTool: HttpToolSchema) =>
  async (payload: HttpToolPayload) => {
    console.log('HTTP Tool Config', httpTool?.config);
    console.log('HTTP Tool Payload', payload);

    const config = httpTool?.config as HttpToolSchema['config'];

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

      return { data };
    } catch (err) {
      console.log('HTTP Tool Error', err);
    }
  }) as CreateToolHandler;

export const createParser =
  (tool: HttpToolSchema, config: any) => (payload: string) => {
    try {
      // const schema = eval(
      //   jsonSchemaToZod(toJsonSchema(tool)?.parameters, { module: 'cjs' })
      // ) as z.ZodSchema;

      // const values = schema.parse(JSON.parse(payload));

      return createToolParser(toJsonSchema(tool)?.parameters)(payload);
    } catch (err) {
      console.log('Parser Error', err);
      throw err;
    }
  };
