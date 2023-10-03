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

type ToolExtended = Tool & {
  datastore: Datastore | null;
};

export type AgentWithTools = Agent & {
  tools: ToolExtended[];
};

type MessageExtended = Pick<Message, 'from' | 'text' | 'sources'> & {
  sources: Source[];
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

  push(
    message: Pick<Message, 'from' | 'text'> & {
      id?: string;
      createdAt?: Date;
      sources?: Source[];
    }
  ) {
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
            data: this.messages,
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
            data: this.messages,
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

    return conversation;
  }
}
