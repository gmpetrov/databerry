import { NextApiResponse } from 'next';
import { z } from 'zod';

import { AppNextApiRequest } from '@app/types';
import { UpsertAgentSchema } from '@app/types/dtos';
import { createAuthApiHandler, respond } from '@app/utils/createa-api-handler';
import prisma from '@app/utils/prisma-client';
import validate from '@app/utils/validate';

const handler = createAuthApiHandler();

const Schema = UpsertAgentSchema.pick({ handle: true });

export const checkHandleAvailable = async (
  req: AppNextApiRequest,
  res: NextApiResponse
) => {
  const session = req.session;
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
    body: UpsertAgentSchema.pick({ handle: true }),
    handler: respond(checkHandleAvailable),
  })
);

export default handler;
