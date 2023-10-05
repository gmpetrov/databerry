import { NextApiResponse } from 'next';
import { z } from 'zod';

import {
  createAuthApiHandler,
  respond,
} from '@chaindesk/lib/createa-api-handler';
import { AppNextApiRequest } from '@chaindesk/lib/types';
import { CreateAgentSchema } from '@chaindesk/lib/types/dtos';
import validate from '@chaindesk/lib/validate';
import { prisma } from '@chaindesk/prisma/client';

const handler = createAuthApiHandler();

const Schema = CreateAgentSchema.pick({ handle: true });

export const checkHandleAvailable = async (
  req: AppNextApiRequest,
  res: NextApiResponse
) => {
  const { handle } = req.body as z.infer<typeof Schema>;

  const agent = await prisma.agent.findUnique({
    where: {
      handle: handle!,
    },
  });

  const available = !agent;

  return {
    agentId: agent?.id,
    available,
  };
};

handler.post(
  validate({
    body: CreateAgentSchema.pick({ handle: true }),
    handler: respond(checkHandleAvailable),
  })
);

export default handler;
