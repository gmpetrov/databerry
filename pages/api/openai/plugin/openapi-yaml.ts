import fs from 'fs';
import { NextApiResponse } from 'next';
import path from 'path';
import { parseDocument } from 'yaml';

import { AppNextApiRequest } from '@app/types/index';
import { createApiHandler } from '@app/utils/createa-api-handler';
import getSubdomain from '@app/utils/get-subdomain';
import prisma from '@app/utils/prisma-client';
import validate from '@app/utils/validate';

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
  doc.setIn(['info', 'servers', 0, 'url'], `https://${host}`);

  res.setHeader('Content-Type', 'text/x-yaml');

  return res.send(doc.toString());
};
handler.get(generateOpenApiYaml);

export default handler;
