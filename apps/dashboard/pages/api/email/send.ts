import { NextApiResponse } from 'next';
import { z } from 'zod';

import {
  createLazyAuthHandler,
  respond,
} from '@chaindesk/lib/createa-api-handler';
import mailer from '@chaindesk/lib/mailer';
import { AppNextApiRequest } from '@chaindesk/lib/types';
import validate from '@chaindesk/lib/validate';
const handler = createLazyAuthHandler();

const emailSchema = z.object({
  to: z.string().email(),
  subject: z.string(),
  body: z.string(),
});

export const send = async (req: AppNextApiRequest, res: NextApiResponse) => {
  const data = req.body;

  try {
    await mailer.sendMail({
      from: {
        name: 'Chaindesk',
        address: process.env.EMAIL_FROM!,
      },
      to: data.to,
      subject: data.subject,
      html: data.body,
    });
  } catch (err) {
    throw err;
  }
};

handler.post(
  validate({
    body: emailSchema,
    handler: respond(send),
  })
);

export default handler;
