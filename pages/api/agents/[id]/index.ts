import { AgentVisibility, MembershipRole } from '@prisma/client';
import { NextApiResponse } from 'next';

import { AppNextApiRequest } from '@app/types/index';
import { ApiError, ApiErrorType } from '@app/utils/api-error';
import { createLazyAuthHandler, respond } from '@app/utils/createa-api-handler';
import cors from '@app/utils/middlewares/cors';
import pipe from '@app/utils/middlewares/pipe';
import roles from '@app/utils/middlewares/roles';
import prisma from '@app/utils/prisma-client';

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
      tools: {
        include: {
          datastore: true,
        },
      },
    },
  });

  if (
    agent?.visibility === AgentVisibility.private &&
    agent?.organizationId !== session?.organization?.id
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
  const id = req.query.id as string;

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

  await prisma.agent.delete({
    where: {
      id,
    },
  });

  return agent;
};

handler.delete(
  pipe(
    roles([MembershipRole.ADMIN, MembershipRole.OWNER]),
    respond(deleteAgent)
  )
);

export default pipe(cors({ methods: ['GET', 'DELETE', 'HEAD'] }), handler);
