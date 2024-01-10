import Cors from 'cors';
import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';

import { NewLead, render } from '@chaindesk/emails';
import { ApiError, ApiErrorType } from '@chaindesk/lib/api-error';
import { createApiHandler, respond } from '@chaindesk/lib/createa-api-handler';
import mailer from '@chaindesk/lib/mailer';
import runMiddleware from '@chaindesk/lib/run-middleware';
import { AppNextApiRequest } from '@chaindesk/lib/types/index';
import { validate } from '@chaindesk/lib/validate';
import { prisma } from '@chaindesk/prisma/client';

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
              status: {
                in: ['active', 'trialing'],
              },
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
    prisma.contact.upsert({
      where: {
        unique_email_for_org: {
          email: data.visitorEmail,
          organizationId: agent?.organizationId!,
        },
      },
      create: {
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
        conversations: {
          connect: {
            id: data.conversationId,
          },
        },
      },
      update: {
        conversations: {
          connect: {
            id: data.conversationId,
          },
        },
      },
    }),
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
        conversation: {
          connect: {
            id: data.conversationId,
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
      subject: `🎯 New lead captured by Agent ${agent?.name || ''}`,
      html: render(
        <NewLead
          visitorEmail={data.visitorEmail}
          agentName={agent.name}
          messages={agent?.conversations?.[0]?.messages}
          ctaLink={`${
            process.env.NEXT_PUBLIC_DASHBOARD_URL
          }/logs?tab=all&conversationId=${encodeURIComponent(
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
