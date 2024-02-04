import createToolParser from '@chaindesk/lib/create-tool-parser';
import {
  LeadCaptureToolSchema,
  ToolResponseSchema,
} from '@chaindesk/lib/types/dtos';
import { ConversationStatus } from '@chaindesk/prisma';
import prisma from '@chaindesk/prisma/client';

import { CreateToolHandlerConfig, ToolToJsonSchema } from './type';

export type LeadCaptureToolPayload = Record<string, unknown>;

export const toJsonSchema = ((tool: LeadCaptureToolSchema, config) => {
  return {
    name: `lead_capture`,
    description: 'Useful for collecting users email or phonenumber.',
    parameters: {
      type: 'object',
      properties: {
        // ...(tool?.config?.isEmailEnabled
        ...(true
          ? {
              email: {
                type: 'string',
                format: 'email',
                description: 'Email provided by the user',
              },
            }
          : {}),
        ...(tool?.config?.isPhoneNumberEnabled
          ? {
              phoneNumber: {
                type: 'string',
              },
              phoneNumberCountryCode: {
                type: 'string',
              },
            }
          : {}),
      },
      required: ['email'],
    },
  };
}) as ToolToJsonSchema;

export const createHandler =
  (
    tool: LeadCaptureToolSchema,
    config: CreateToolHandlerConfig<{ type: 'request_human' }>
  ) =>
  async (payload: LeadCaptureToolPayload): Promise<ToolResponseSchema> => {
    const conversationId = config?.conversationId as string;

    // await prisma.conversation.update({
    //   where: {
    //     id: conversationId,
    //   },
    //   data: {
    //     status: ConversationStatus.HUMAN_REQUESTED,
    //   },
    // });

    console.log('LEAD CAPTURED ----------------->', payload);

    return {
      data: 'User informations saved successfully.',
    };
  };

export const createParser =
  (tool: LeadCaptureToolSchema, config: any) => (payload: string) => {
    // return createToolParser(toJsonSchema(tool)?.parameters)(payload);
    return createToolParser(toJsonSchema(tool)?.parameters)(payload);
  };
