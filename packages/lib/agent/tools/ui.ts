import { handleFormValid } from '@chaindesk/lib/forms';
import slugify from '@chaindesk/lib/slugify';
import {
  ChatRequest,
  FormConfigSchema,
  FormToolSchema,
} from '@chaindesk/lib/types/dtos';
import { Form } from '@chaindesk/prisma';

import { CreateToolHandler, ToolToJsonSchema } from './type';

export type FormToolPayload = Record<string, unknown>;

export const toJsonSchema = ((_, config) => {
  return {
    name: `generate_ui_component`,
    description:
      'Enhance your questions with a UI component when relevant. Do not use the result of this tool directly.',
    parameters: {
      type: 'object',
      properties: {
        ui_type: {
          type: 'string',
          enum: ['multiple_choice'],
        },
        choices: {
          type: 'array',
          items: {
            type: 'string',
          },
        },
      },
      required: ['ui_type', 'choices'],
    },
  };
}) as ToolToJsonSchema;

export const createHandler = ((tool: FormToolSchema, config) =>
  async (payload: FormToolPayload) => {
    console.log('PAYLLOAD =-----===>', payload);
    return {
      data: 'ok',
      metadata: {
        ui: {
          type: 'multiple_choice',
          choices: ['hello', 'world'],
        },
      },
    };
  }) as CreateToolHandler;
