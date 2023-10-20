import Cors from 'cors';
import { NextApiResponse } from 'next';
import z from 'zod';

import { ApiError, ApiErrorType } from '@chaindesk/lib/api-error';
import {
  createLazyAuthHandler,
  respond,
} from '@chaindesk/lib/createa-api-handler';
import runMiddleware from '@chaindesk/lib/run-middleware';
import { ConversationStatusSchema } from '@chaindesk/lib/types/dtos';
import { AppNextApiRequest } from '@chaindesk/lib/types/index';
import { AgentVisibility, Prisma } from '@chaindesk/prisma';
import { prisma } from '@chaindesk/prisma/client';

const handler = createLazyAuthHandler();

const cors = Cors({
  methods: ['GET', 'PATCH', 'DELETE', 'HEAD'],
});

export const getConversation = async (
  req: AppNextApiRequest,
  res: NextApiResponse
) => {
  const session = req.session;
  const conversationId = req.query.conversationId as string;
  const cursor = req.query.cursor as string;

  const conversation = await prisma.conversation.findUnique({
    where: {
      id: conversationId,
    },
    select: {
      status: true,
      agent: true,
      messages: {
        take: 50,
        ...(cursor
          ? {
              skip: 1,
              cursor: {
                id: cursor,
              },
            }
          : {}),
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  });

  if (
    conversation?.agent?.visibility === AgentVisibility.private &&
    conversation?.agent?.organizationId !== session?.organization?.id
  ) {
    throw new ApiError(ApiErrorType.UNAUTHORIZED);
  }

  return conversation;
};

handler.get(respond(getConversation));

export const updateConversation = async (
  req: AppNextApiRequest,
  res: NextApiResponse
) => {
  try {
    const session = req.session;
    const conversationId = req.query.conversationId as string;
    const data = ConversationStatusSchema.parse(req.body);

    const conversation = await prisma.conversation.findUnique({
      where: {
        id: conversationId,
      },
      include: {
        agent: true,
      },
    });
    if (
      conversation?.agent?.visibility === AgentVisibility.private &&
      conversation?.agent?.organizationId !== session?.organization?.id
    ) {
      throw new ApiError(ApiErrorType.UNAUTHORIZED);
    }

    const updated = await prisma.conversation.update({
      where: {
        id: conversationId,
      },
      data: {
        status: data.status,
      },
    });

    return updated;
  } catch (e) {
    if (e instanceof z.ZodError) {
      return {
        error: 'error invalid request query',
        details: e.format(),
      };
    } else if (e instanceof Prisma.PrismaClientKnownRequestError) {
      return {
        error: e.meta,
      };
    }
    throw e;
  }
};

handler.patch(respond(updateConversation));

export const deleteConversation = async (
  req: AppNextApiRequest,
  res: NextApiResponse
) => {
  const session = req.session;
  const conversationId = req.query.conversationId as string;
  const cursor = req.body.cursor as string;

  if (!session?.organization?.id) {
    throw new ApiError(ApiErrorType.UNAUTHORIZED);
  }

  const conversation = await prisma.conversation.findUnique({
    where: {
      id: conversationId,
    },
    include: {
      agent: true,
      messages: {
        take: -20,
        ...(cursor
          ? {
              cursor: {
                id: cursor,
              },
            }
          : {}),
        orderBy: {
          createdAt: 'asc',
        },
      },
    },
  });

  if (conversation?.agent?.organizationId !== session?.organization?.id) {
    throw new ApiError(ApiErrorType.UNAUTHORIZED);
  }

  return conversation;
};

handler.delete(respond(deleteConversation));

export default async function wrapper(
  req: AppNextApiRequest,
  res: NextApiResponse
) {
  await runMiddleware(req, res, cors);

  return handler(req, res);
}
