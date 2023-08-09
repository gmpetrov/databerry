import { AgentVisibility } from '@prisma/client';
import Cors from 'cors';
import { NextApiResponse } from 'next';

import { EvalAnswer } from '@app/types/dtos';
import { AppNextApiRequest } from '@app/types/index';
import { ApiError, ApiErrorType } from '@app/utils/api-error';
import { createLazyAuthHandler, respond } from '@app/utils/createa-api-handler';
import prisma from '@app/utils/prisma-client';
import runMiddleware from '@app/utils/run-middleware';
import validate from '@app/utils/validate';

const handler = createLazyAuthHandler();

const cors = Cors({
  methods: ['POST', 'HEAD'],
});

export const evalAnswer = async (
  req: AppNextApiRequest,
  res: NextApiResponse
) => {
  const session = req.session;
  const data = req.body as EvalAnswer;
  const message = await prisma.message.findUnique({
    where: {
      id: data.messageId,
    },
    include: {
      conversation: {
        include: {
          agent: true,
        },
      },
    },
  });

  if (!message) {
    throw new ApiError(ApiErrorType.NOT_FOUND);
  }

  if (
    message?.conversation?.agent?.visibility === AgentVisibility.private &&
    message?.conversation?.agent?.ownerId !== session?.user?.id
  ) {
    throw new ApiError(ApiErrorType.UNAUTHORIZED);
  }

  const updated = await prisma.message.update({
    where: {
      id: data.messageId,
    },
    data: {
      eval: data.eval,
    },
  });

  return updated;
};

handler.post(
  validate({
    body: EvalAnswer,
    handler: respond(evalAnswer),
  })
);

export default async function wrapper(
  req: AppNextApiRequest,
  res: NextApiResponse
) {
  await runMiddleware(req, res, cors);

  return handler(req, res);
}
