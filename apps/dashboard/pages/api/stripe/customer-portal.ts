import { NextApiResponse } from 'next';

import {
  createAuthApiHandler,
  respond,
} from '@chaindesk/lib/createa-api-handler';
import { stripe } from '@chaindesk/lib/stripe-client';
import { AppNextApiRequest } from '@chaindesk/lib/types/index';
import validate from '@chaindesk/lib/validate';

const handler = createAuthApiHandler();

export const createCustomerPortalLink = async (
  req: AppNextApiRequest,
  res: NextApiResponse
) => {
  const session = req.session;

  const { url } = await stripe.billingPortal.sessions.create({
    customer: session?.organization?.customerId!,
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
