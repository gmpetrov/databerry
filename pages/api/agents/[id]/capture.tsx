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

  const html = `
  <html>
  <head>
    <meta charset="utf-8" />
    <meta http-equiv="x-ua-compatible" content="ie=edge" />
    <title>Welcome Email</title>

    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Josefin+Sans:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;1,100;1,200;1,300;1,400;1,500;1,600;1,700&display=swap"
      rel="stylesheet"
    />

    <style>
      * {
        font-family: 'Josefin Sans', sans-serif;
      }

      h2 {
      }

      .history {
        display: flex;
        flex-direction: column;
      }

      .message {
        margin-right: auto;
        border: 1px solid rgba(0, 0, 0, 0.5);
        border-radius: 8px;
        padding: 2px 8px;
        margin-bottom: 10px;
      }

      .agent {
        background-color: #000;
        color: white;
        margin-left: 10px;
      }

      .message p {
        padding: 0;
        line-height: 2rem;
        margin: 0;
      }
      
      .reply > div {
        margin-top: 20px;
        padding: 10px 15px;
        border: 2px solid white;
        display: inline-flex;
        border-radius: 100px;
        background-color: #5937a8;
        color: white;
        font-size: 1rem;
        margin-bottom: 80px;
      }
    </style>
  </head>
  <body>
    <h2>ChatbotGPT.ai</h2>
    <h3>Visitor requested assistance</h3>

    <p>Visitor Email: <strong>${data.visitorEmail}</strong></p>

    <p>A visitor has requested assistance from your agent ${agent?.name}</p>

    <p>Conversation History:</p>

    <table class="history">

      ${agent?.conversations?.[0]?.messages
        ?.map(
          (message) => `
      <tr>
        <td>
        <div class="message ${message.from}">
          <p>${message.text}</p>
        </div>
        </td>
      </tr>
      `
        )
        .join('\n')}

    </table>

    <a href="mailto:${data.visitorEmail}" class="reply">
      <div>Reply</div>
    </a>
  </body>
</html>
  `;

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
