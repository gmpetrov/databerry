import cuid from 'cuid';
import { JSONSchema7 } from 'json-schema';

import { FormStatus } from '@chaindesk/prisma';
import prisma from '@chaindesk/prisma/client';

import { FormFieldSchema } from './types/dtos';

export function formToJsonSchema(fields: FormFieldSchema[]): JSONSchema7 {
  const defaultValue = {
    type: 'object',
    properties: {},
    required: [],
  } as JSONSchema7;

  if ((fields || [])?.length <= 0) {
    return defaultValue;
  }

  return fields.reduce(
    (acc, field) => {
      acc['properties']![field.name] = {
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
        ...acc.required!,
        ...(field.required ? [field.name] : []),
      ];
      return acc;
    },
    { type: 'object', properties: {}, required: [] } as JSONSchema7
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
