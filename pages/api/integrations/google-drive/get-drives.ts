import { NextApiResponse } from 'next';

import { AppNextApiRequest } from '@app/types/index';
import { ApiError, ApiErrorType } from '@app/utils/api-error';
import { createAuthApiHandler, respond } from '@app/utils/createa-api-handler';
import { GoogleDriveManager } from '@app/utils/google-drive-manager';
import prisma from '@app/utils/prisma-client';

const handler = createAuthApiHandler();

export const getDrives = async (
  req: AppNextApiRequest,
  res: NextApiResponse
) => {
  const session = req.session;

  const providerId = req.query.providerId as string;
  const nextPageToken = req.query.nextPageToken as string;

  if (!providerId) {
    throw new ApiError(ApiErrorType.INVALID_REQUEST);
  }

  const provider = await prisma.serviceProvider.findUnique({
    where: {
      id: providerId,
    },
  });

  if (provider?.ownerId !== session?.user?.id) {
    throw new ApiError(ApiErrorType.UNAUTHORIZED);
  }

  const driveManager = new GoogleDriveManager({
    accessToken: provider?.accessToken!,
    refreshToken: provider?.refreshToken!,
  });

  const results = await driveManager.listDrives({});

  return results?.data;
};

handler.get(respond(getDrives));

export default handler;
