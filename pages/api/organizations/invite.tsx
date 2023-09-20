import { Prisma } from '@prisma/client';
import { render } from '@react-email/components';
import cuid from 'cuid';
import * as jose from 'jose';
import { NextApiResponse } from 'next';

import InviteUser from '@app/components/emails/InviteUser';
import { AppNextApiRequest } from '@app/types';
import { OrganizationInviteSchema, UpdateOrgSchema } from '@app/types/dtos';
import { ApiError, ApiErrorType } from '@app/utils/api-error';
import { createAuthApiHandler, respond } from '@app/utils/createa-api-handler';
import mailer from '@app/utils/mailer';
import prisma from '@app/utils/prisma-client';
import validate from '@app/utils/validate';

const handler = createAuthApiHandler();

export const invite = async (req: AppNextApiRequest, res: NextApiResponse) => {
  const session = req.session;
  const data = req.body as OrganizationInviteSchema;

  try {
    const exist = await prisma.membership.findFirst({
      where: {
        organizationId: session.organization.id,
        user: {
          email: data.email,
        },
      },
    });

    if (exist) {
      throw new ApiError(ApiErrorType.ALREADY_INVITED);
    }

    const membershipId = cuid();

    const token = await new jose.SignJWT({})
      .setProtectedHeader({ alg: 'HS256' })
      .setJti(membershipId)
      .sign(new TextEncoder().encode(process.env.JWT_SECRET));

    const membership = await prisma.membership.create({
      data: {
        id: membershipId,
        invitedToken: token,
        invitedEmail: data.email,
        organizationId: session.organization.id,
        role: 'USER',
      },
    });

    await mailer.sendMail({
      from: {
        name: 'Chaindesk',
        address: process.env.EMAIL_FROM!,
      },
      to: data.email,
      subject: `💌 You have been invited to join ${session?.organization?.name}`,
      html: render(
        <InviteUser
          teamName={session?.organization?.name}
          username={data.email}
          invitedByEmail={session?.user?.email!}
          inviteLink={`${
            process.env.NEXT_PUBLIC_DASHBOARD_URL
          }/join?token=${encodeURIComponent(token)}&id=${encodeURIComponent(
            membership.id
          )}`}
        />
      ),
    });

    return membership;
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === 'P2002') {
        throw new ApiError(ApiErrorType.ALREADY_INVITED);
      }
    }
    throw err;
  }
};

handler.post(
  validate({
    body: OrganizationInviteSchema,
    handler: respond(invite),
  })
);

export default handler;
