import { render } from '@react-email/components';
import Cors from 'cors';
import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';

import HelpRequest from '@app/components/emails/HelpRequest';
import { AppNextApiRequest } from '@app/types/index';
import { ApiError, ApiErrorType } from '@app/utils/api-error';
import { createApiHandler, respond } from '@app/utils/createa-api-handler';
import mailer from '@app/utils/mailer';
import prisma from '@app/utils/prisma-client';
import runMiddleware from '@app/utils/run-middleware';
import { validate } from '@app/utils/validate';

const handler = createApiHandler();

const cors = Cors({
  methods: ['POST', 'HEAD'],
});

const CaptureRequestSchema = z.object({
  visitorId: z.string().min(1),
  visitorEmail: z.string().min(1),
  conversationId: z.string().cuid(),
});

type CaptureRequestSchemaType = z.infer<typeof CaptureRequestSchema>;

export const capture = async (req: AppNextApiRequest, res: NextApiResponse) => {
  const agentId = req.query.id as string;
  const data = req.body as CaptureRequestSchemaType;

  const agent = await prisma.agent.findUnique({
    where: {
      id: agentId,
    },
    include: {
      organization: {
        include: {
          usage: true,
          apiKeys: true,
          memberships: {
            where: {
              role: 'OWNER',
            },
            include: {
              user: true,
            },
          },
          subscriptions: {
            where: {
              status: 'active',
            },
          },
        },
      },
      conversations: {
        where: {
          id: data.conversationId,
          agentId: agentId,
        },
        take: 1,
        include: {
          messages: {
            take: -20,
            orderBy: {
              createdAt: 'asc',
            },
          },
        },
      },
    },
  });

  const onwerEmail = agent?.organization?.memberships?.[0]?.user?.email!;

  if (!onwerEmail) {
    throw new ApiError(ApiErrorType.INVALID_REQUEST);
  }

  await Promise.all([
    prisma.lead.create({
      data: {
        email: data.visitorEmail,
        agent: {
          connect: {
            id: agentId,
          },
        },
        organization: {
          connect: {
            id: agent?.organizationId!,
          },
        },
      },
    }),
    mailer.sendMail({
      from: {
        name: 'Chaindesk',
        address: process.env.EMAIL_FROM!,
      },
      to: onwerEmail,
      subject: '❓ Visitor requested assistance',
      html: render(
        <HelpRequest
          visitorEmail={data.visitorEmail}
          agentName={agent.name}
          messages={agent?.conversations?.[0]?.messages}
          ctaLink={`${
            process.env.NEXT_PUBLIC_DASHBOARD_URL
          }/logs?conversationId=${encodeURIComponent(
            data.conversationId
          )}&targetOrgId=${encodeURIComponent(agent.organizationId!)}`}
        />
      ),
    }),
  ]);

  return true;
};

handler.post(
  validate({
    body: CaptureRequestSchema,
    handler: respond(capture),
  })
);

export default async function wrapper(
  req: AppNextApiRequest,
  res: NextApiResponse
) {
  await runMiddleware(req, res, cors);

  return handler(req, res);
}
