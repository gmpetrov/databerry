import createToolParser from '@chaindesk/lib/create-tool-parser';
import EventDispatcher from '@chaindesk/lib/events/dispatcher';
import formatPhoneNumber from '@chaindesk/lib/format-phone-number';
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
      'Useful to save the user informations to the organization once all filed have been provided. Trigger only when all the required field have been answered by the user. Each field is provided by the user not by the AI. Never fill a field if not provided by the user.',
    // 'Trigger only when all the required field have been answered by the user. Each field is provided by the user not by the AI. Never fill a field if not provided by the user.',
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
                description: 'Phone number provided by the user',
              },
              phoneNumberExtension: {
                type: 'string',
                description:
                  'A valid phone number extension provided by the user. e.g: +33 for France',
              },
            }
          : {}),
      },
      required: [
        ...(tool?.config?.isEmailEnabled ? ['email'] : []),
        ...(tool?.config?.isPhoneNumberEnabled
          ? ['phoneNumber', 'phoneNumberExtension']
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
    const phoneNumber = (payload?.phoneNumber || '') as string;
    const phoneNumberExtension = (payload?.phoneNumberExtension ||
      '') as string;
    const formattedPhoneNumber = formatPhoneNumber({
      phoneNumber: phoneNumberExtension + phoneNumber,
    });

    if (email || formattedPhoneNumber) {
      const contacts = await prisma.contact.findMany({
        where: {
          organizationId: config.organizationId,
          OR: [
            {
              email,
            },
            {
              phoneNumber: formattedPhoneNumber,
            },
          ],
        },
      });

      if (contacts?.length === 0) {
        const [createdContact] = await Promise.all([
          prisma.contact.upsert({
            where: {
              unique_email_for_org: {
                email,
                organizationId: config.organizationId!,
              },
            },
            create: {
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
              phoneNumber: formattedPhoneNumber,
            },
            update: {
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
              phoneNumber: formattedPhoneNumber,
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
              phoneNumber: formattedPhoneNumber,
            },
          }),
        ]);

        console.log('createdContact', createdContact);

        await EventDispatcher.dispatch({
          type: 'lead-captured',
          agent: createdContact?.organization?.agents?.[0]!,
          conversation: createdContact?.organization?.conversations?.[0]!,
          messages:
            createdContact?.organization?.conversations?.[0]?.messages || [],
          adminEmail:
            createdContact?.organization?.memberships?.[0]?.user?.email!,
          customerEmail: email,
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
