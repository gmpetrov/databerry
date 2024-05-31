import axios, { AxiosHeaders } from 'axios';
import { NextApiResponse } from 'next';
import z from 'zod';

import {
  createAuthApiHandler,
  respond,
} from '@chaindesk/lib/createa-api-handler';
import { AppNextApiRequest } from '@chaindesk/lib/types';

const handler = createAuthApiHandler();

const bodySchema = z.object({
  url: z.string().url(),
  headers: z.record(z.string(), z.string()).optional(),
  body: z.record(z.string(), z.unknown()).optional(),
  method: z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH']).default('GET'),
});

export const validateEndpoint = async (
  req: AppNextApiRequest,
  res: NextApiResponse
) => {
  let testResult: any;
  try {
    const requestBody = bodySchema.parse(req.body);

    const url = requestBody.url;
    const requestPayload = {
      headers: { ...requestBody.headers } as unknown as AxiosHeaders,
      body: requestBody,
    };

    switch (requestBody.method) {
      case 'GET': {
        const response = await axios.get(url, requestPayload);
        testResult = { status: response.status, data: response.data };
        break;
      }
      case 'DELETE': {
        const response = await axios.delete(url, requestPayload);
        testResult = { status: response.status, data: response.data };
        break;
      }
      case 'PATCH': {
        const response = await axios.patch(url, requestPayload);
        testResult = { status: response.status, data: response.data };
        break;
      }
      case 'POST': {
        const response = await axios.post(url, requestPayload);
        testResult = { status: response.status, data: response.data };
        break;
      }
      case 'PUT': {
        const response = await axios.put(url, requestPayload);
        testResult = { status: response.status, data: response.data };
        break;
      }
    }
  } catch (e) {
    testResult = { status: 400, error: e };
  }

  return testResult;
};

handler.post(respond(validateEndpoint));

export default handler;
