import {
  Agent,
  ConversationChannel,
  Datastore,
  Message,
  Tool,
} from "@prisma/client";

import prisma from "@app/utils/prisma-client";

import cuid from "./cuid";

type ToolExtended = Tool & {
  datastore: Datastore | null;
};

export type AgentWithTools = Agent & {
  tools: ToolExtended[];
};

export default class ConversationManager {
  userId?: string;
  visitorId?: string;
  conversationId?: string;
  channel: ConversationChannel;
  messages: Pick<Message, "from" | "text" | "createdAt">[] = [];
  agentId: string;
  metadata?: Record<string, any> = {};

  constructor({
    agentId,
    userId,
    visitorId,
    channel,
    conversationId,
    metadata,
  }: {
    agentId: string;
    channel: ConversationChannel;
    conversationId?: string;
    userId?: string;
    visitorId?: string;
    metadata?: Record<string, any>;
  }) {
    this.messages = [];
    this.userId = userId;
    this.visitorId = visitorId;
    this.conversationId = conversationId || cuid();
    this.channel = channel;
    this.agentId = agentId;
    this.metadata = metadata;
  }

  push(
    message: Pick<Message, "from" | "text"> & {
      createdAt?: Date;
    }
  ) {
    this.messages.push({
      createdAt: new Date(),
      ...message,
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
        agent: {
          connect: {
            id: this.agentId,
          },
        },
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
