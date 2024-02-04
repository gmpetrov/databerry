import createToolParser from '@chaindesk/lib/create-tool-parser';
import EventDispatcher from '@chaindesk/lib/events/dispatcher';
import {
  LeadCaptureToolSchema,
  ToolResponseSchema,
} from '@chaindesk/lib/types/dtos';
import prisma from '@chaindesk/prisma/client';

import { CreateToolHandlerConfig, ToolToJsonSchema } from './type';

export type LeadCaptureToolPayload = Record<string, unknown>;

export const toJsonSchema = ((tool: LeadCaptureToolSchema, config) => {
  return {
    name: `lead_capture`,
    description:
      'Trigger only when all the required field have been answered by the user. Each field is provided by the user not by the AI. Never fill a field if not provided by the user.',
    parameters: {
      type: 'object',
      properties: {
        ...(tool?.config?.isEmailEnabled
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
      required: [
        ...(tool?.config?.isEmailEnabled ? ['email'] : []),
        ...(tool?.config?.isPhoneNumberEnabled
          ? ['phoneNumber', 'phoneNumberCountryCode']
          : []),
      ],
    },
  };
}) as ToolToJsonSchema;

export const createHandler =
  (
    tool: LeadCaptureToolSchema,
    config: CreateToolHandlerConfig<{ type: 'request_human' }>
  ) =>
  async (payload: LeadCaptureToolPayload): Promise<ToolResponseSchema> => {
    const email = payload?.email as string;
    const phoneNumber = payload?.phoneNumber as string;

    if (email || phoneNumber) {
      const contacts = await prisma.contact.findMany({
        where: {
          organizationId: config.organizationId,
          OR: [
            {
              email,
            },
            {
              phoneNumber,
            },
          ],
        },
      });

      if (contacts?.length === 0) {
        const [createdContact] = await Promise.all([
          prisma.contact.create({
            data: {
              organization: {
                connect: {
                  id: config.organizationId!,
                },
              },
              conversationsV2: {
                connect: {
                  id: config.conversationId!,
                },
              },
              email,
              phoneNumber,
            },
            include: {
              organization: {
                include: {
                  memberships: {
                    take: 1,
                    where: {
                      role: 'OWNER',
                    },
                    include: {
                      user: true,
                    },
                  },
                  agents: {
                    take: 1,
                    where: {
                      id: config.agentId!,
                    },
                    include: {
                      serviceProviders: true,
                    },
                  },
                  conversations: {
                    take: 1,
                    where: {
                      id: config.conversationId!,
                    },
                    include: {
                      messages: {
                        take: -24,
                        orderBy: {
                          createdAt: 'asc',
                        },
                        include: {
                          attachments: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          }),
          prisma.lead.create({
            data: {
              organization: {
                connect: {
                  id: config.organizationId!,
                },
              },
              conversation: {
                connect: {
                  id: config.conversationId!,
                },
              },
              agent: {
                connect: {
                  id: config.agentId!,
                },
              },
              email,
              phoneNumber,
            },
          }),
        ]);

        await EventDispatcher.dispatch({
          type: 'lead-captured',
          agent: createdContact?.organization?.agents?.[0]!,
          conversation: createdContact?.organization?.conversations?.[0]!,
          messages:
            createdContact?.organization?.conversations?.[0]?.messages || [],
          adminEmail:
            createdContact?.organization?.memberships?.[0]?.user?.email!,
        });
      } else {
        await prisma.conversation.update({
          where: {
            organizationId: config.organizationId!,
            id: config.conversationId!,
          },
          data: {
            participantsContacts: {
              connect: {
                id: contacts[0].id,
              },
            },
          },
        });
      }
    }

    return {
      data: 'User informations saved successfully.',
    };
  };

export const createParser =
  (tool: LeadCaptureToolSchema, config: any) => (payload: string) => {
    // return createToolParser(toJsonSchema(tool)?.parameters)(payload);
    return createToolParser(toJsonSchema(tool)?.parameters)(payload);
  };
