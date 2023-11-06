import Cors from 'cors';
import fs from 'fs';
import { NextApiRequest, NextApiResponse } from 'next';
import path from 'path';
import { parseDocument } from 'yaml';

import { apiUrl } from '@chaindesk/lib/config';
import { createApiHandler } from '@chaindesk/lib/createa-api-handler';
import getSubdomain from '@chaindesk/lib/get-subdomain';
import runMiddleware from '@chaindesk/lib/run-middleware';
import { AppNextApiRequest } from '@chaindesk/lib/types/index';
import validate from '@chaindesk/lib/validate';
import { prisma } from '@chaindesk/prisma/client';

const cors = Cors({
  methods: ['POST', 'HEAD', 'GET'],
});

const handler = createApiHandler();

export const generateOpenApiYaml = async (
  req: AppNextApiRequest,
  res: NextApiResponse
) => {
  const host = req?.headers?.['host'];
  const subdomain = getSubdomain(host!);

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

  const file = fs.readFileSync(
    path.resolve(process.cwd(), 'base.openapi.yaml'),
    'utf8'
  );
  const doc = parseDocument(file);

  doc.setIn(['info', 'title'], datastore.name);
  doc.setIn(['info', 'description'], datastore.description);
  doc.setIn(
    ['info', 'servers', 0, 'url'],
    `${apiUrl}/datastores/query/${datastore.id}`
    // `http://localhost:3000`
  );

  const str = doc
    .toString()
    .replace('/DATASTORE_QUERY_PATH', `/datastores/query/${datastore.id}`);

  res.setHeader('Content-Type', 'text/x-yaml');

  return res.send(str);
};

handler.get(generateOpenApiYaml);

export default async function wrapper(
  req: AppNextApiRequest,
  res: NextApiResponse
) {
  await runMiddleware(req, res, cors);

  return handler(req, res);
}
