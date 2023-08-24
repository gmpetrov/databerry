import {
  Agent,
  ConversationChannel,
  Datastore,
  Message,
  Tool,
} from '@prisma/client';

import { Source } from '@app/types/document';
import prisma from '@app/utils/prisma-client';

import cuid from './cuid';

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
  userId?: string;
  visitorId?: string;
  conversationId?: string;
  channel: ConversationChannel;
  messages: MessageExtended[] = [];
  agentId?: string;
  metadata?: Record<string, any> = {};

  constructor({
    agentId,
    userId,
    visitorId,
    channel,
    conversationId,
    metadata,
  }: {
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
