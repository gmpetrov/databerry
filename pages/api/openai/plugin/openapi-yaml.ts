import Cors from 'cors';
import fs from 'fs';
import { NextApiRequest, NextApiResponse } from 'next';
import path from 'path';
import { parseDocument } from 'yaml';

import { AppNextApiRequest } from '@app/types/index';
import { createApiHandler } from '@app/utils/createa-api-handler';
import getSubdomain from '@app/utils/get-subdomain';
import prisma from '@app/utils/prisma-client';
import runMiddleware from '@app/utils/run-middleware';
import validate from '@app/utils/validate';

const cors = Cors({
  methods: ['POST', 'HEAD', 'GET'],
});

const handler = createApiHandler();

export const generateOpenApiYaml = async (
  req: AppNextApiRequest,
  res: NextApiResponse
) => {
  const host = req?.headers?.["host"];
  const subdomain = getSubdomain(host!);

  if (!subdomain) {
    return res.status(400).send("Missing subdomain");
  }

  const datastore = await prisma.datastore.findUnique({
    where: {
      id: subdomain,
    },
  });

  if (!datastore) {
    return res.status(404).send("Not found");
  }

  const file = fs.readFileSync(
    path.resolve(process.cwd(), "base.openapi.yaml"),
    "utf8"
  );
  const doc = parseDocument(file);

  doc.setIn(['info', 'title'], datastore.name);
  doc.setIn(['info', 'description'], datastore.description);
  doc.setIn(
    ['info', 'servers', 0, 'url'],
    `https://api.griotai.kasetolabs.xyz/datastores/query/${datastore.id}`
    // `http://localhost:3000`
  );

  const str = doc
    .toString()
    .replace('/DATASTORE_QUERY_PATH', `/datastores/query/${datastore.id}`);

  res.setHeader("Content-Type", "text/x-yaml");

  return res.send(str);
};

handler.get(generateOpenApiYaml);

export default async function wrapper(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await runMiddleware(req, res, cors);

  return handler(req, res);
}
