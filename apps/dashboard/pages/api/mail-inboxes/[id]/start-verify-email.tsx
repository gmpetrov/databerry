import cuid from 'cuid';
import { NextApiResponse } from 'next';

import { GenericTemplate, render } from '@chaindesk/emails';
import { ApiError, ApiErrorType } from '@chaindesk/lib/api-error';
import {
  createAuthApiHandler,
  respond,
} from '@chaindesk/lib/createa-api-handler';
import mailer from '@chaindesk/lib/mailer';
import { AppNextApiRequest } from '@chaindesk/lib/types/index';
import { prisma } from '@chaindesk/prisma/client';

const handler = createAuthApiHandler();

export const startVerifyEmail = async (
  req: AppNextApiRequest,
  res: NextApiResponse
) => {
  const id = req.query.id as string;

  const item = await prisma.mailInbox.findUnique({
    where: {
      id,
    },
    include: {
      customEmailVerificationToken: true,
    },
  });

  console.log('item', item);

  if (item?.organizationId !== req.session?.organization?.id) {
    throw new ApiError(ApiErrorType.UNAUTHORIZED);
  }

  if (!item?.customEmail) {
    throw new ApiError(ApiErrorType.INVALID_REQUEST);
  }

  if (item?.customEmailVerificationToken?.code) {
    await prisma.verificationCode.delete({
      where: {
        code: item?.customEmailVerificationToken?.code,
      },
    });
  }

  const code = cuid();

  await prisma.mailInbox.update({
    where: {
      id,
    },
    data: {
      isCustomEmailVerified: false,
      customEmailVerificationToken: {
        connectOrCreate: {
          where: {
            code,
          },
          create: {
            code,
          },
        },
      },
    },
  });

  await mailer.sendMail({
    from: {
      name: 'Chaindesk',
      address: process.env.EMAIL_FROM!,
    },
    to: item.customEmail,
    subject: `Custom Email Verification`,
    html: render(
      <GenericTemplate
        title={'Custom Email Verification'}
        description="Please verify your custom email address by clicking the button below. If you did not request this, you can safely ignore this email."
        cta={{
          label: 'Validate',
          href: `${process.env.NEXT_PUBLIC_DASHBOARD_URL}/api/mail-inboxes/${id}/verify-email?token=${code}&email=${item.customEmail}`,
        }}
      />
    ),
  });
};

handler.post(respond(startVerifyEmail));

export default handler;
