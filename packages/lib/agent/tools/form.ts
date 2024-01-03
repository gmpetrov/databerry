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

export const toJsonSchema = ((tool: FormToolSchema, config) => {
  const form = tool.form as Form;
  const useDraftConfig = !!config?.toolConfig?.useDraftConfig;
  const formConfig = (
    useDraftConfig ? form?.draftConfig : form?.publishedConfig
  ) as FormConfigSchema;

  return {
    name: `isFormValid_${slugify(form.name)}`,
    description: 'Trigger only when all the required field have been answered',
    parameters: (formConfig as any)?.schema,
  };
}) as ToolToJsonSchema;

export const createHandler = ((tool: FormToolSchema, config) =>
  async (payload: FormToolPayload) => {
    const form = tool.form as Form;
    const useDraftConfig = !!config?.toolConfig?.useDraftConfig;
    const conversationId = config?.conversationId as string;
    const formConfig = (
      useDraftConfig ? form?.draftConfig : form?.publishedConfig
    ) as FormConfigSchema;

    await handleFormValid({
      conversationId,
      formId: tool.formId,
      values: payload,
      webhookUrl: formConfig?.webhook?.url!,
    });

    return {
      data: 'Form submitted successfully',
    };
  }) as CreateToolHandler;
