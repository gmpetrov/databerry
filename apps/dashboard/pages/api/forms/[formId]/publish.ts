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

type Field = {
  id: string;
  required: boolean;
  fieldName: string;
};

type InputObject = {
  fields: Field[];
};

type Schema = {
  type: 'object';
  required: string[];
  properties: {
    [key: string]: {
      id: string;
      type: string;
    };
  };
};

function generateSchema(fields: Field[]): Schema {
  return fields?.reduce(
    (acc, field) => {
      acc['properties'][field.fieldName] = {
        id: field.id,
        type: 'string',
      };
      acc['required'] = [
        ...acc.required,
        ...(field.required ? [field.fieldName] : []),
      ];
      return acc;
    },
    { type: 'object', properties: {}, required: [] } as Schema
  );
}

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
  const schema = generateSchema(fields);
  await prisma.form.update({
    where: {
      id: formId,
    },
    data: {
      publishedConfig: {
        schema,
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
