import { NextApiResponse } from 'next/types';
import { AppNextApiRequest } from '@chaindesk/lib/types';
import {
  createLazyAuthHandler,
  respond,
} from '@chaindesk/lib/createa-api-handler';
import prisma from '@chaindesk/prisma/client';
import { ServiceProviderType } from '@chaindesk/prisma';

// import shopify from '../sdk';

const handler = createLazyAuthHandler();

export const webhook = async (req: AppNextApiRequest, res: NextApiResponse) => {
  // TODO: need a middleware with similar func as express.text()
  // const validation = await shopify.webhooks.validate({
  //   rawBody: req.body,
  //   rawRequest: req,
  //   rawResponse: res,
  // });

  const provider = await prisma.serviceProvider.findUnique({
    where: {
      unique_external_id: {
        type: ServiceProviderType.shopify,
        externalId: req.body.domain,
      },
    },
  });

  if (!provider) {
    throw new Error('Service provider does not exist.');
  }

  await prisma.serviceProvider.delete({
    where: {
      unique_external_id: {
        type: ServiceProviderType.shopify,
        externalId: req.body.domain,
      },
    },
  });

  return { status: 200 };
};

handler.post(respond(webhook));

export default handler;
