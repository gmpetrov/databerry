import { NextApiResponse } from 'next';
import { z } from 'zod';

import { AppNextApiRequest } from '@app/types/index';
import { createAuthApiHandler, respond } from '@app/utils/createa-api-handler';
import { stripe } from '@app/utils/stripe';
import validate from '@app/utils/validate';

const handler = createAuthApiHandler();

const Schema = z.object({
  checkoutSessionId: z.string().min(1),
});

export const getCheckoutSession = async (
  req: AppNextApiRequest,
  res: NextApiResponse
) => {
  const checkoutSessionId = req.body.checkoutSessionId as string;

  const data = await stripe.checkout.sessions.retrieve(checkoutSessionId);

  return data;
};

handler.post(
  validate({
    body: Schema,
    handler: respond(getCheckoutSession),
  })
);

export default handler;
