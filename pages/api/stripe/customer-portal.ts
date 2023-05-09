import { NextApiResponse } from 'next';

import { AppNextApiRequest } from '@app/types/index';
import { createAuthApiHandler, respond } from '@app/utils/createa-api-handler';
import { stripe } from '@app/utils/stripe';
import validate from '@app/utils/validate';

const handler = createAuthApiHandler();

export const createCustomerPortalLink = async (
  req: AppNextApiRequest,
  res: NextApiResponse
) => {
  const session = req.session;

  const { url } = await stripe.billingPortal.sessions.create({
    customer: session.user.customerId,
    return_url: `${process.env.NEXT_PUBLIC_DASHBOARD_URL!}/account`,
  });

  return url;
};

handler.post(
  validate({
    // body: SearchManyRequestSchema,
    handler: respond(createCustomerPortalLink),
  })
);

export default handler;
