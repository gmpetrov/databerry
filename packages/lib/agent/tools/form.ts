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

export const toJsonSchema = ((tool: FormToolSchema, toolConfig) => {
  const form = tool.form as Form;
  const useDraftConfig = !!toolConfig?.useDraftConfig;
  const config = (
    useDraftConfig ? form?.draftConfig : form?.publishedConfig
  ) as FormConfigSchema;

  return {
    name: `isFormValid_${slugify(form.name)}`,
    description: 'Trigger only when all the required field have been answered',
    parameters: (config as any)?.schema,
  };
}) as ToolToJsonSchema;

export const createHandler = ((tool: FormToolSchema, toolConfig) =>
  async (payload: FormToolPayload) => {
    const form = tool.form as Form;
    const useDraftConfig = !!toolConfig?.useDraftConfig;
    const config = (
      useDraftConfig ? form?.draftConfig : form?.publishedConfig
    ) as FormConfigSchema;

    await handleFormValid({
      // conversationId: c?.id!,
      formId: tool.formId,
      values: payload,
      webhookUrl: config?.webhook?.url!,
    });

    return {
      data: 'Form submitted successfully',
    };
  }) as CreateToolHandler;
