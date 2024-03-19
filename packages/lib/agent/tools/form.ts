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
import { ConversationChannel, Form } from '@chaindesk/prisma';
import prisma from '@chaindesk/prisma/client';

import {
  CreateToolHandler,
  CreateToolHandlerConfig,
  ToolToJsonSchema,
} from './type';

export type FormToolPayload = Record<string, unknown>;

export const toJsonSchema = ((tool: FormToolSchema) => {
  const form = tool.form as Form;
  return {
    name: `share-form-${slugify(form.name)}`,
    description: `Generally, This is a tool that prompt the user with a form. ** Importantly **: ${
      (tool.config as any)?.trigger
    }`,
  };
}) as any;

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
      type: 'form-submission',
      conversationId,
      formId: tool.formId,
      formValues: payload,
    });

    return {
      data: 'Form submitted successfully',
    };
  };

export const createHandlerV2 =
  (
    tool: FormToolSchema,
    config: CreateToolHandlerConfig<{ type: 'form' }>,
    channel?: ConversationChannel
  ) =>
  async (): Promise<ToolResponseSchema> => {
    const { metadata } = await prisma.conversation.findUniqueOrThrow({
      where: {
        id: config.conversationId!,
      },
      select: {
        metadata: true,
      },
    });

    if ((metadata as any)?.isFormSubmitted === true) {
      return {
        data: 'The user has already filled the form.',
      };
    } else if ((metadata as any)?.isFormSubmitted === false) {
      return {
        data: 'The user has already been prompted with a form, ask him to use the previously provided one.',
      };
    }

    const form = tool.form as Form;
    await prisma.conversation.update({
      where: {
        id: config.conversationId!,
      },
      data: {
        metadata: {
          ...(metadata ? (metadata as object) : {}),
          isFormSubmitted: false,
        },
      },
    });

    if (['website', 'dashboard'].includes(channel || '')) {
      return {
        data: `should display form`,
        metadata: {
          shouldDisplayForm: true,
          formId: form.id,
          conversationId: config?.conversationId,
        },
      };
    } else {
      return {
        data: `send the user this form url: ${process.env.NEXT_PUBLIC_DASHBOARD_URL}/forms/${form.id}?conversationId=${config?.conversationId}`,
      };
    }
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
