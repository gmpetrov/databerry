import cuid from 'cuid';

import {
  Agent,
  ConversationChannel,
  Datastore,
  Message,
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
};

export default class ConversationManager {
  organizationId: string;
  userId?: string;
  visitorId?: string;
  conversationId?: string;
  channel: ConversationChannel;
  messages: MessageExtended[] = [];
  agentId?: string;
  metadata?: Record<string, any> = {};

  constructor({
    organizationId,
    agentId,
    userId,
    visitorId,
    channel,
    conversationId,
    metadata,
  }: {
    organizationId: string;
    agentId?: string;
    channel: ConversationChannel;
    conversationId?: string;
    userId?: string;
    visitorId?: string;
    metadata?: Record<string, any>;
  }) {
    this.messages = [];
    this.userId = userId;
    this.visitorId = visitorId || cuid();
    this.conversationId = conversationId || cuid();
    this.channel = channel;
    this.agentId = agentId;
    this.metadata = metadata;
    this.organizationId = organizationId;
  }

  push(message: MessageExtended) {
    this.messages.push({
      createdAt: new Date(),
      ...message,
      sources: message.sources || [],
    });
  }

  async save() {
    if (!this.userId && !this.visitorId) {
      return;
    }

    const msgIds = this.messages.map(() => cuid());

    const messages = this.messages.map((each, index) => {
      const { approvals, id, ...rest } = each as any;

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
        organization: {
          connect: {
            id: this.organizationId,
          },
        },
        ...(this.agentId
          ? {
              agent: {
                connect: {
                  id: this.agentId,
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

    return conversation;
  }
}
