// Not Usede ATM. But keeping it for reference in case we implement file uploading later

import { NextApiResponse } from 'next';
import { z } from 'zod';

import { AppNextApiRequest } from '@app/types';
import { GenerateUploadLinkRequest } from '@app/types/dtos';
import { ApiError, ApiErrorType } from '@app/utils/api-error';
import { s3 } from '@app/utils/aws';
import { createAuthApiHandler, respond } from '@app/utils/createa-api-handler';
import prisma from '@app/utils/prisma-client';
import validate from '@app/utils/validate';

const handler = createAuthApiHandler();

const GenerateUploadLinkRequestSchema = GenerateUploadLinkRequest.extend({
  type: z.enum([
    'image/png',
    'image/jpeg',
    'image/gif',
    'image/avif',
    'image/apng',
    'image/svg+xml',
    'image/webp',
  ]),
});

export const generateUploadLink = async (
  req: AppNextApiRequest,
  res: NextApiResponse
) => {
  const data = req.body as z.infer<typeof GenerateUploadLinkRequestSchema>;
  const session = req.session;
  const id = req.query.id as string;

  const agent = await prisma.agent.findUnique({
    where: {
      id,
    },
  });

  if (agent?.ownerId !== session?.user?.id) {
    throw new ApiError(ApiErrorType.UNAUTHORIZED);
  }

  const param = {
    Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME,
    Key: `agents/${agent.id}/${data.fileName}`,
    Expires: 900,
    ACL: 'public-read',
    ContentType: data.type,
  };

  return s3.getSignedUrlPromise('putObject', param);
};

handler.post(
  validate({
    body: GenerateUploadLinkRequestSchema,
    handler: respond(generateUploadLink),
  })
);

export default handler;
