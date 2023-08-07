import { AgentVisibility } from '@prisma/client';
import Cors from 'cors';
import { NextApiResponse } from 'next';

import { AppNextApiRequest } from '@app/types/index';
import { ApiError, ApiErrorType } from '@app/utils/api-error';
import { createLazyAuthHandler, respond } from '@app/utils/createa-api-handler';
import prisma from '@app/utils/prisma-client';
import runMiddleware from '@app/utils/run-middleware';

const cors = Cors({
  methods: ['GET', 'DELETE', 'HEAD'],
});

const handler = createLazyAuthHandler();

export const getAgent = async (
  req: AppNextApiRequest,
  res: NextApiResponse
) => {
  const session = req.session;
  const id = req.query.id as string;

  const agent = await prisma.agent.findUnique({
    where: {
      id,
    },
    include: {
      // owner: {
      //   include: {
      //     usage: true,
      //   }
      // },
      tools: {
        include: {
          datastore: true,
        },
      },
    },
  });

  if (
    agent?.visibility === AgentVisibility.private &&
    agent?.ownerId !== session?.user?.id
  ) {
    throw new ApiError(ApiErrorType.UNAUTHORIZED);
  }

  return agent;
};

handler.get(respond(getAgent));

export const deleteAgent = async (
  req: AppNextApiRequest,
  res: NextApiResponse
) => {
  const session = req.session;
  const id = req.query.id as string;

  if (!session?.user) {
    throw new ApiError(ApiErrorType.UNAUTHORIZED);
  }

  const agent = await prisma.agent.findUnique({
    where: {
      id,
    },
    include: {
      tools: {
        include: {
          datastore: true,
        },
      },
    },
  });

  if (agent?.ownerId !== session?.user?.id) {
    throw new ApiError(ApiErrorType.UNAUTHORIZED);
  }

  await prisma.agent.delete({
    where: {
      id,
    },
  });

  return agent;
};

handler.delete(respond(deleteAgent));

export default async function wrapper(
  req: AppNextApiRequest,
  res: NextApiResponse
) {
  await runMiddleware(req, res, cors);

  return handler(req, res);
}
