import { NextApiResponse } from 'next';
import {
  createAuthApiHandler,
  respond,
} from '@chaindesk/lib/createa-api-handler';
import { AppNextApiRequest } from '@chaindesk/lib/types';
import validate from '@chaindesk/lib/validate';
import {
  ServiceProviderZendeskSchema,
  ServiceProviderZendesk,
} from '@chaindesk/lib/types/dtos';

import getHttpClient from '../lib/get-http-client';
import defaultAddServiceProvider from '../../_utils/default-add-service-provider';

const handler = createAuthApiHandler();

// export const add = async (req: AppNextApiRequest, res: NextApiResponse) => {
//   const url = `https://${
//     process.env.ZENDESK_SUBDOMAIN
//   }.zendesk.com/oauth/authorizations/new?${new URLSearchParams({
//     response_type: 'code',
//     redirect_uri: `${process.env.NEXT_PUBLIC_DASHBOARD_URL}/api/integrations/zendesk/callback`,
//     client_id: process.env.ZENDESK_CLIENT_ID!,
//     scope,
//     state: (req.query.state as string) || '{}',
//   }).toString()}`;

//   return res.json({ url });
// };

// handler.get(respond(add));

const createCredentials = async (
  req: AppNextApiRequest,
  res: NextApiResponse
) => {
  const config = req.body.config as ServiceProviderZendesk['config'];

  return defaultAddServiceProvider<ServiceProviderZendesk['config']>({
    config,
    session: req.session,
    agentId: req.query.agentId as string,
    name: config?.email,
    validate: async (config) => {
      const client = getHttpClient(config);
      const res = await client.get('/api/v2/users/me.json');

      return !!res?.data?.user?.id;
    },
  });
};

handler.post(
  validate({
    handler: respond(createCredentials),
    body: ServiceProviderZendeskSchema.pick({
      config: true,
    }),
  })
);

export default handler;
