import axios from 'axios';

import { HttpToolSchema } from '@chaindesk/lib/types/dtos';

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
  (httpTool: HttpToolSchema) => async (payload: HttpToolPayload) => {
    console.log('HTTP Tool Config', httpTool?.config);
    console.log('HTTP Tool Payload', payload);

    const config = httpTool?.config as HttpToolSchema['config'];

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

    const { data } = await axios(url, {
      method: config?.method,
      headers: {
        ...config?.headers
          ?.filter((each) => !each.isUserProvided)
          .reduce((acc, curr) => ({ ...acc, [curr.key]: curr.value }), {}),
        ...config?.headers
          ?.filter((each) => !!each.isUserProvided)
          .reduce(
            (acc, curr) => ({ ...acc, [curr.key]: payload[curr.key] }),
            {}
          ),
      },
      data: {
        ...config?.body
          ?.filter((each) => !each.isUserProvided)
          .reduce((acc, curr) => ({ ...acc, [curr.key]: curr.value }), {}),
        ...config?.body
          ?.filter((each) => !!each.isUserProvided)
          .reduce(
            (acc, curr) => ({ ...acc, [curr.key]: payload[curr.key] }),
            {}
          ),
      },
    });

    return data;
  };
