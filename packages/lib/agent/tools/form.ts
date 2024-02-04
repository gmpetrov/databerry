import type { Schema as JSONSchema } from 'jsonschema';

import createToolParser from '@chaindesk/lib/create-tool-parser';
import EventDispatcher from '@chaindesk/lib/events/dispatcher';
import { handleFormValid } from '@chaindesk/lib/forms';
import slugify from '@chaindesk/lib/slugify';
import {
  ChatRequest,
  FormConfigSchema,
  FormToolSchema,
  ToolResponseSchema,
} from '@chaindesk/lib/types/dtos';
import { Form } from '@chaindesk/prisma';

import {
  CreateToolHandler,
  CreateToolHandlerConfig,
  ToolToJsonSchema,
} from './type';

export type FormToolPayload = Record<string, unknown>;

export const toJsonSchema = ((tool: FormToolSchema, config) => {
  const form = tool.form as Form;
  const useDraftConfig = !!config?.toolConfig?.useDraftConfig;
  const formConfig = (
    useDraftConfig ? form?.draftConfig : form?.publishedConfig
  ) as FormConfigSchema;

  return {
    name: `isFormValid_${slugify(form.name)}`,
    description:
      'Trigger only when all the required field have been answered by the user. Each field is provided by the user not by the AI. Never fill a field if not provided by the user.',
    parameters: (formConfig as any)?.schema,
  };
}) as ToolToJsonSchema;

export const createHandler =
  (tool: FormToolSchema, config: CreateToolHandlerConfig<{ type: 'form' }>) =>
  async (payload: FormToolPayload): Promise<ToolResponseSchema> => {
    const form = tool.form as Form;
    const useDraftConfig = !!config?.toolConfig?.useDraftConfig;
    const conversationId = config?.conversationId as string;
    const formConfig = (
      useDraftConfig ? form?.draftConfig : form?.publishedConfig
    ) as FormConfigSchema;

    await EventDispatcher.dispatch({
      type: 'blablaform-submission',
      conversationId,
      formId: tool.formId,
      formValues: payload,
    });

    return {
      data: 'Form submitted successfully',
    };
  };

export const createParser =
  (tool: FormToolSchema, config: any) => (payload: string) => {
    const form = tool.form as Form;
    const useDraftConfig = !!config?.toolConfig?.useDraftConfig;
    const formConfig = (
      useDraftConfig ? form?.draftConfig : form?.publishedConfig
    ) as FormConfigSchema;
    const schema = formConfig?.schema as JSONSchema;

    return createToolParser(schema)(payload);
  };
