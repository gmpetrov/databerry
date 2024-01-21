import cuid from 'cuid';
import type { Schema as JSONSchema } from 'jsonschema';

import slugify from '@chaindesk/lib/slugify';
import { FormStatus } from '@chaindesk/prisma';
import prisma from '@chaindesk/prisma/client';

import { FormFieldSchema } from '../types/dtos';

export function formToJsonSchema(fields: FormFieldSchema[]): JSONSchema {
  const defaultValue = {
    type: 'object',
    properties: {},
    required: [],
  } as JSONSchema;

  if ((fields || [])?.length <= 0) {
    return defaultValue;
  }

  return fields.reduce(
    (acc, field) => {
      const fieldName = slugify(field.name);

      acc['properties']![fieldName] = {
        // id: field.id,
        ...(field.type === 'text'
          ? {
              type: 'string',
            }
          : {}),
        ...(field.type === 'multiple_choice'
          ? {
              type: 'string',
              enum: field.choices,
            }
          : {}),
      };
      acc['required'] = [
        ...(acc.required! as string[]),
        ...(field.required ? [fieldName] : []),
      ];
      return acc;
    },
    { type: 'object', properties: {}, required: [] } as JSONSchema
  );
}

export const handleFormValid = async ({
  conversationId,
  formId,
  values,
  webhookUrl,
  submissionId = cuid(),
}: {
  formId: string;
  conversationId?: string;
  submissionId?: string;
  webhookUrl?: string;
  values: any;
}) => {
  const submission = await prisma.formSubmission.upsert({
    where: {
      id: submissionId,
    },
    create: {
      conversationId: conversationId,
      formId: formId,
      data: values,
      status: FormStatus.COMPLETED,
    },
    update: {
      data: values,
      status: FormStatus.COMPLETED,
    },
  });

  if (webhookUrl) {
    try {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submission),
      });
    } catch (e) {
      console.log('error', e);
    }
  }
};
