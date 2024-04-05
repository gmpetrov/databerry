import axios from 'axios';
import cuid from 'cuid';
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
import { ConversationChannel, Form, Prisma } from '@chaindesk/prisma';
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

    await axios.post(
      `${process.env.NEXT_PUBLIC_DASHBOARD_URL}/api/forms/${tool.formId}`,
      {
        conversationId,
        formId: tool.formId,
        formValues: payload,
      }
    );

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
    const messageId = cuid();

    const form = tool.form as Form;

    return {
      data: `Form URL: ${process.env.NEXT_PUBLIC_DASHBOARD_URL}/forms/${form.id}?conversationId=${config?.conversationId}&messageId=${messageId}`,
      messageId,
      metadata: {
        isFormSubmitted: false,
        shouldDisplayForm: true,
        formId: form.id,
      },
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
