// Not Usede ATM. But keeping it for reference in case we implement file uploading later

import { NextApiResponse } from 'next';
import { z } from 'zod';

import { s3 } from '@chaindesk/lib/aws';
import {
  createAuthApiHandler,
  respond,
} from '@chaindesk/lib/createa-api-handler';
import { AppNextApiRequest } from '@chaindesk/lib/types';
import { GenerateUploadLinkRequest } from '@chaindesk/lib/types/dtos';
import validate from '@chaindesk/lib/validate';
import { prisma } from '@chaindesk/prisma/client';

const handler = createAuthApiHandler();

export const generateUploadLink = async (
  req: AppNextApiRequest,
  res: NextApiResponse
) => {
  const data = req.body as GenerateUploadLinkRequest;
  const session = req.session;
  const id = req.query.id as string;

  const datastore = await prisma.datastore.findUnique({
    where: {
      id,
    },
  });

  if (datastore?.organizationId !== session?.organization?.id) {
    throw new Error('Unauthorized');
  }

  const param = {
    Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME,
    Key: `datastores/${datastore?.id!}/${data.fileName}`,
    Expires: 900,
    ContentType: data.type,
  };

  return s3.getSignedUrlPromise('putObject', param);
};

handler.post(
  validate({
    body: GenerateUploadLinkRequest,
    handler: respond(generateUploadLink),
  })
);

export default handler;
