import { Prisma } from '@prisma/client';
import Cors from 'cors';
import cuid from 'cuid';
import { NextApiResponse } from 'next';

import {
  createAuthApiHandler,
  respond,
} from '@chaindesk/lib/createa-api-handler';
import generateFunId from '@chaindesk/lib/generate-fun-id';
import runMiddleware from '@chaindesk/lib/run-middleware';
import { AppNextApiRequest } from '@chaindesk/lib/types';
import { CreateFormSchema } from '@chaindesk/lib/types/dtos';
import validate from '@chaindesk/lib/validate';
import { prisma } from '@chaindesk/prisma/client';

const handler = createAuthApiHandler();

const cors = Cors({
  methods: ['POST', 'HEAD'],
});

export const getForms = async (
  req: AppNextApiRequest,
  res: NextApiResponse
) => {
  const session = req.session;
  const published = req.query.published === 'true';

  const forms = await prisma.form.findMany({
    where: {
      organizationId: session?.organization?.id,
      ...(published
        ? {
            publishedConfig: {
              not: Prisma.AnyNull,
            },
          }
        : {}),
    },
    include: {
      _count: {
        select: {
          submissions: true,
          conversations: true,
        },
      },
    },
    orderBy: {
      updatedAt: 'desc',
    },
  });

  return forms;
};

handler.get(respond(getForms));

export const createForm = async (
  req: AppNextApiRequest,
  res: NextApiResponse
) => {
  const data = CreateFormSchema.parse(req.body);
  const organizationId = req.session.organization.id as string;

  return prisma.form.create({
    data: {
      id: cuid(),
      name: data.name || generateFunId(),
      organization: {
        connect: {
          id: organizationId,
        },
      },
      draftConfig: data.draftConfig,
    },
  });
};

handler.post(
  validate({
    body: CreateFormSchema,
    handler: respond(createForm),
  })
);

export default async function wrapper(
  req: AppNextApiRequest,
  res: NextApiResponse
) {
  await runMiddleware(req, res, cors);

  return handler(req, res);
}
