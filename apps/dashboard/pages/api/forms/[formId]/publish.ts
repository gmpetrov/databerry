import Cors from 'cors';
import { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';
import { z } from 'zod';

import { ApiError, ApiErrorType } from '@chaindesk/lib/api-error';
import { BlablaSchema } from '@chaindesk/lib/blablaform';
import { createApiHandler, respond } from '@chaindesk/lib/createa-api-handler';
import runMiddleware from '@chaindesk/lib/run-middleware';
import { AppNextApiRequest } from '@chaindesk/lib/types';
import validate from '@chaindesk/lib/validate';
import { prisma } from '@chaindesk/prisma/client';

const handler = createApiHandler();

const cors = Cors({
  methods: ['POST', 'HEAD'],
});

// publish the draftconfig -> turn them into a schema first then update publishConfig
export const publishForm = async (
  req: AppNextApiRequest,
  res: NextApiResponse
) => {
  const formId = req.query.formId as string;
  const found = await prisma.form.findUnique({
    where: {
      id: formId,
    },
    select: {
      draftConfig: true,
    },
  });

  if (!found) {
    throw new ApiError(ApiErrorType.NOT_FOUND);
  }
  const fields = (found?.draftConfig as any)?.fields;

  if (!fields) {
    throw new Error('Must register at least one ield');
  }
  const schema = formToJsonSchema(fields);
  await prisma.form.update({
    where: {
      id: formId,
    },
    data: {
      publishedConfig: {
        schema: schema as any,
        introScreen: (found?.draftConfig as any).introScreen,
      },
    },
  });

  // TODO: add publish form-to-url logic
  return schema;
};

handler.post(respond(publishForm));

export default async function wrapper(
  req: AppNextApiRequest,
  res: NextApiResponse
) {
  await runMiddleware(req, res, cors);

  return handler(req, res);
}
function formToJsonSchema(fields: any) {
  throw new Error('Function not implemented.');
}
