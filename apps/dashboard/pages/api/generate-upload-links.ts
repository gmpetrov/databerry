import { NextApiResponse } from 'next';
import pMap from 'p-map';

import { ApiError, ApiErrorType } from '@chaindesk/lib/api-error';
import { s3 } from '@chaindesk/lib/aws';
import {
  createLazyAuthHandler,
  respond,
} from '@chaindesk/lib/createa-api-handler';
import { creatChatUploadKey } from '@chaindesk/lib/file-upload';
import getS3RootDomain from '@chaindesk/lib/get-s3-root-domain';
import cors from '@chaindesk/lib/middlewares/cors';
import pipe from '@chaindesk/lib/middlewares/pipe';
import { AppNextApiRequest } from '@chaindesk/lib/types';
import { GenerateManyUploadLinksSchema } from '@chaindesk/lib/types/dtos';
import validate from '@chaindesk/lib/validate';
import { prisma } from '@chaindesk/prisma/client';

const handler = createLazyAuthHandler();

export const generateUploadLinks = async (
  req: AppNextApiRequest,
  res: NextApiResponse
) => {
  const data = req.body as GenerateManyUploadLinksSchema;
  const session = req.session;
  const id = req.query.id as string;

  return pMap(data, async (item) => {
    let prefix = ``;
    const useCase = item.case;
    let organizationId = session?.organization?.id;
    const isAuthenticated = !!organizationId;

    switch (useCase) {
      case 'agentIcon':
        if (!isAuthenticated) {
          throw new ApiError(ApiErrorType.UNAUTHORIZED);
        }
        const agent = await prisma.agent.findUnique({
          where: {
            id,
          },
        });

        if (agent?.organizationId !== session?.organization?.id) {
          throw new ApiError(ApiErrorType.UNAUTHORIZED);
        }

        prefix = `agents/${item.agentId}`;
        break;
      case 'organizationIcon':
        if (!isAuthenticated) {
          throw new ApiError(ApiErrorType.UNAUTHORIZED);
        }
        prefix = `organizations/${session?.organization?.id}`;
        break;
      case 'userIcon':
        if (!isAuthenticated) {
          throw new ApiError(ApiErrorType.UNAUTHORIZED);
        }
        prefix = `users/${session?.user?.id}`;
        break;
      case 'chatUpload':
        // Allow unauthenticated users to upload to chat if agentId is provided and agent is public
        if (!organizationId) {
          if (!item.conversationId || !item.agentId) {
            throw new ApiError(ApiErrorType.UNAUTHORIZED);
          }

          const agent = await prisma.agent.findUnique({
            where: {
              id: item.agentId,
              visibility: 'public',
            },
          });

          if (!agent) {
            throw new ApiError(ApiErrorType.UNAUTHORIZED);
          }

          organizationId = agent.organizationId as string;
        }

        prefix = creatChatUploadKey({
          organizationId,
          conversationId: item.conversationId,
        });
        break;
      default:
        throw new ApiError(ApiErrorType.INVALID_REQUEST);
    }

    const key = `${prefix}/${item.fileName}`;
    const param = {
      Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME,
      Key: key,
      Expires: 900,
      ContentType: item.mimeType,
    };

    const signedUrl = await s3.getSignedUrlPromise('putObject', param);
    return {
      signedUrl,
      fileUrl: `${getS3RootDomain()}/${key}`,
    };
  });
};

handler.post(
  validate({
    body: GenerateManyUploadLinksSchema,
    handler: respond(generateUploadLinks),
  })
);

export default pipe(cors({ methods: ['POST', 'HEAD'] }), handler);
