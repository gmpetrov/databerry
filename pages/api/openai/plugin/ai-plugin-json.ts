import { DatastoreVisibility } from '@prisma/client';
import Cors from 'cors';
import { NextApiRequest, NextApiResponse } from 'next';

import { AppNextApiRequest } from '@app/types/index';
import { createApiHandler, respond } from '@app/utils/createa-api-handler';
import getSubdomain from '@app/utils/get-subdomain';
import prisma from '@app/utils/prisma-client';
import runMiddleware from '@app/utils/run-middleware';

const handler = createApiHandler();

const cors = Cors({
  methods: ['POST', 'HEAD', 'GET'],
});

const safePluginName = (str: string) =>
  str
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\s/g, '_');

export const generateAiPluginJson = async (
  req: AppNextApiRequest,
  res: NextApiResponse
) => {
  const host = req?.headers?.['host'];
  const subdomain = getSubdomain(host!);
  const proto = req.headers['x-forwarded-proto'] ? 'https' : 'http';

  if (!subdomain) {
    return res.status(400).send('Missing subdomain');
  }

  const datastore = await prisma.datastore.findUnique({
    where: {
      id: subdomain,
    },
  });

  if (!datastore) {
    return res.status(404).send('Not found');
  }

  const config = {
    schema_version: 'v1',
    name_for_model: `${safePluginName(
      datastore.pluginName || datastore.name?.substring(0, 20)
    )}_${datastore.id}`,
    name_for_human: datastore.pluginName || datastore.name?.substring(0, 20),
    description_for_model: datastore.pluginDescriptionForModel,
    description_for_human: datastore.pluginDescriptionForHumans,
    ...(datastore.visibility === DatastoreVisibility.public
      ? {
          auth: {
            type: 'none',
          },
        }
      : {
          auth: {
            type: 'user_http',
            authorization_type: 'bearer',
          },
        }),
    api: {
      type: 'openapi',
      url: `${proto}://${host}/.well-known/openapi.yaml`,
      has_user_authentication: false,
    },
    logo_url:
      datastore.pluginIconUrl || `${proto}://${host}/.well-known/logo.png`,
    contact_email: 'support@chaindesk.ai',
    legal_info_url: 'support@chaindesk.ai',
  };

  return res.json(config);
};

handler.get(generateAiPluginJson);

export default async function wrapper(
  req: AppNextApiRequest,
  res: NextApiResponse
) {
  await runMiddleware(req, res, cors);

  return handler(req, res);
}
