import cuid from 'cuid';

import {
  Agent,
  Attachment,
  ConversationChannel,
  ConversationStatus,
  Datastore,
  Message,
  Prisma,
  ServiceProviderType,
  Tool,
} from '@chaindesk/prisma';
import { prisma } from '@chaindesk/prisma/client';

import { Source } from './types/document';
import { ChatResponse } from './types/dtos';

type ToolExtended = Tool & {
  datastore: Datastore | null;
};

export type AgentWithTools = Agent & {
  tools: ToolExtended[];
};

type MessageExtended = Pick<Message, 'from' | 'text'> & {
  id?: string;
  createdAt?: Date;
  sources?: Source[];
  usage?: ChatResponse['usage'];
  approvals?: ChatResponse['approvals'];
  inputId?: string;
  metadata?: Record<string, any>;
  attachments?: Pick<Attachment, 'mimeType' | 'name' | 'size' | 'url'>[];
  externalId?: string;
};

type ExternalConfig = {
  externalId: string;
  serviceProviderType: ServiceProviderType;
  externalConversationId: string;
  metadata?: Record<PropertyKey, any>;
};

export default class ConversationManager {
  organizationId?: string;
  userId?: string;
  visitorId?: string;
  conversationId?: string;
  channel: ConversationChannel;
  messages: MessageExtended[] = [];
  agentId?: string;
  metadata?: Record<PropertyKey, any> = {};
  channelExternalId?: string;
  channelCredentialsId?: string;
  formId?: string;
  status?: ConversationStatus;

  constructor({
    organizationId,
    agentId,
    userId,
    visitorId,
    channel,
    conversationId,
    metadata,
    channelExternalId,
    channelCredentialsId,
    formId,
  }: {
    organizationId?: string;
    agentId?: string;
    channel: ConversationChannel;
    conversationId?: string;
    userId?: string;
    visitorId?: string;
    metadata?: Record<PropertyKey, any>;
    channelExternalId?: string;
    channelCredentialsId?: string;
    formId?: string;
    status?: ConversationStatus;
  }) {
    this.messages = [];
    this.userId = userId;
    this.visitorId = visitorId || cuid();
    this.conversationId = conversationId || cuid();
    this.channel = channel;
    this.agentId = agentId;
    this.metadata = metadata;
    this.organizationId = organizationId;
    this.channelExternalId = channelExternalId;
    this.channelCredentialsId = channelCredentialsId;
    this.formId = formId;
  }

  push(message: MessageExtended) {
    this.messages.push({
      createdAt: new Date(),
      ...message,
      sources: message.sources || [],
      attachments: message.attachments,
    });
  }

  async save() {
    if (!this.userId && !this.visitorId) {
      return;
    }

    const msgIds = this.messages.map(() => cuid());

    const messages = this.messages.map((each, index) => {
      const { approvals, attachments, id, ...rest } = each as any;

      if (id) {
        msgIds[index] = id;
      }

      return {
        ...(rest as MessageExtended),
        id: msgIds[index],
      };
    });

    const conversation = await prisma.conversation.upsert({
      where: {
        id: this.conversationId,
      },
      create: {
        id: this.conversationId,
        channel: this.channel,

        ...(this.organizationId
          ? {
              organization: {
                connect: {
                  id: this.organizationId,
                },
              },
            }
          : {}),
        ...(this.agentId
          ? {
              agent: {
                connect: {
                  id: this.agentId,
                },
              },
            }
          : {}),
        ...(this.formId
          ? {
              form: {
                connect: {
                  id: this.formId,
                },
              },
            }
          : {}),
        messages: {
          createMany: {
            data: messages,
            skipDuplicates: true,
          },
        },
        ...(this.metadata ? { metadata: this.metadata } : {}),
        ...(this.visitorId
          ? {
              visitorId: this.visitorId,
            }
          : {}),
        ...(this.userId
          ? {
              user: {
                connect: {
                  id: this.userId,
                },
              },
            }
          : {}),
      },
      update: {
        ...(this.status
          ? {
              status: this.status,
            }
          : {}),
        channelExternalId: this.channelExternalId,
        ...(this.channelCredentialsId
          ? {
              channelCredentials: {
                connect: {
                  id: this.channelCredentialsId,
                },
              },
            }
          : {}),
        messages: {
          createMany: {
            data: messages,
            skipDuplicates: true,
          },
        },
        ...(this.metadata ? { metadata: this.metadata } : {}),
        ...(this.visitorId
          ? {
              visitorId: this.visitorId,
            }
          : {}),

        ...(this.userId
          ? {
              user: {
                connect: {
                  id: this.userId,
                },
              },
            }
          : {}),
      },
    });

    const approvalsToInsert = this.messages
      .map((each, index) => {
        const { approvals, ...message } = each as any;

        return (approvals as ChatResponse['approvals'])?.map((approval) => ({
          messageId: msgIds[index],
          toolId: approval.tool.id,
          payload: approval.payload as any,
          agentId: this.agentId,
          organizationId: this.organizationId,
        }));
      })
      .filter((each) => !!each)
      .flat();

    if (approvalsToInsert.length > 0) {
      await prisma.actionApproval.createMany({
        data: approvalsToInsert,
      });
    }

    const attachementsToInsert = this.messages
      .map((each, index) => {
        const { attachments } = each;

        return (attachments || [])?.map((attachment) => ({
          ...attachment,
          messageId: msgIds[index],
        }));
      })
      .filter((each) => !!each)
      .flat();

    if (attachementsToInsert.length > 0) {
      await prisma.attachment.createMany({
        data: attachementsToInsert,
      });
    }

    return conversation;
  }

  async createMessage(message: MessageExtended) {
    this.push(message);
    const updated = await this.save();
    this.messages = [];
    return updated;
  }
}
