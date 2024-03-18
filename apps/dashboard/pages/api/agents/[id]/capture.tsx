import { Prisma } from '@prisma/client';
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
  visitorEmail: z.string().optional(),
  phoneNumber: z.string().optional(),
  conversationId: z.union([z.string().cuid().nullish(), z.literal('')]),
});

type CaptureRequestSchemaType = z.infer<typeof CaptureRequestSchema>;

export const capture = async (req: AppNextApiRequest, res: NextApiResponse) => {
  const agentId = req.query.id as string;
  const data = req.body as CaptureRequestSchemaType;

  if (!data.visitorEmail && !data.phoneNumber) {
    throw new ApiError(ApiErrorType.INVALID_REQUEST);
  }

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
      ...(data.conversationId
        ? {
            conversations: {
              where: {
                id: data.conversationId!,
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
          }
        : {}),
    },
  });

  const onwerEmail = agent?.organization?.memberships?.[0]?.user?.email!;

  if (!onwerEmail) {
    throw new ApiError(ApiErrorType.INVALID_REQUEST);
  }

  let conversation = agent?.conversations?.[0];

  // if (!conversation) {
  //   conversation = await prisma.conversation.create({
  //     data: {
  //       agentId,
  //       organizationId: agent?.organizationId!,
  //       channel: 'website',
  //     },
  //     include: {
  //       messages: true,
  //     },
  //   });
  // }

  const visitor = await prisma.visitor.upsert({
    where: {
      id: data.visitorId,
    },
    create: {
      id: data.visitorId,
      organizationId: agent?.organizationId!,
    },
    update: {},
  });

  let contactWithPhone = null;
  let contactWithEmail = null;

  if (data.phoneNumber) {
    contactWithPhone = await prisma.contact.findUnique({
      where: {
        unique_phone_number_for_org: {
          phoneNumber: data.phoneNumber!,
          organizationId: agent?.organizationId!,
        },
      },
    });
  }

  if (data.visitorEmail) {
    contactWithEmail = await prisma.contact.findUnique({
      where: {
        unique_email_for_org: {
          email: data.visitorEmail!,
          organizationId: agent?.organizationId!,
        },
      },
    });
  }

  if (
    contactWithPhone &&
    contactWithEmail &&
    contactWithPhone.id !== contactWithEmail.id
  ) {
    return null;
  }

  await Promise.all([
    prisma.contact.upsert({
      where: {
        ...(contactWithEmail
          ? {
              unique_email_for_org: {
                email: data.visitorEmail,
                organizationId: agent?.organizationId!,
              },
            }
          : contactWithPhone
          ? {
              unique_phone_number_for_org: {
                phoneNumber: data.phoneNumber,
                organizationId: agent?.organizationId!,
              },
            }
          : data.visitorEmail
          ? {
              unique_email_for_org: {
                email: data.visitorEmail,
                organizationId: agent?.organizationId!,
              },
            }
          : data.phoneNumber
          ? {
              unique_phone_number_for_org: {
                phoneNumber: data.phoneNumber,
                organizationId: agent?.organizationId!,
              },
            }
          : {}),
      } as Prisma.ContactWhereUniqueInput,
      create: {
        email: data.visitorEmail,
        phoneNumber: data.phoneNumber,
        visitors: {
          connect: {
            id: visitor.id,
          },
        },
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
        ...(conversation?.id
          ? {
              conversations: {
                connect: {
                  id: conversation?.id,
                },
              },
            }
          : {}),
      },

      update: {
        visitors: {
          connect: {
            id: visitor.id,
          },
        },
        ...(conversation?.id
          ? {
              conversations: {
                connect: {
                  id: conversation?.id,
                },
              },
            }
          : {}),
      },
    }),
    prisma.lead.create({
      data: {
        email: data.visitorEmail,
        phoneNumber: data.phoneNumber,
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

        ...(conversation?.id
          ? {
              conversation: {
                connect: {
                  id: conversation?.id,
                },
              },
            }
          : {}),
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
          messages={(conversation as any)?.messages || []}
          ctaLink={`${
            process.env.NEXT_PUBLIC_DASHBOARD_URL
          }/logs?tab=all&targetConversationId=${encodeURIComponent(
            conversation?.id || ''
          )}&targetOrgId=${encodeURIComponent(agent.organizationId!)}`}
        />
      ),
    }),
  ]);

  return conversation;
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
