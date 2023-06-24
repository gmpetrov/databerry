import { NextApiResponse } from 'next';

import { AppNextApiRequest } from '@app/types/index';
import accountConfig from '@app/utils/account-config';
import { ApiError, ApiErrorType } from '@app/utils/api-error';
import { createAuthApiHandler, respond } from '@app/utils/createa-api-handler';
import { GoogleDriveManager } from '@app/utils/google-drive-manager';
import prisma from '@app/utils/prisma-client';

const handler = createAuthApiHandler();

export const listFolder = async (
  req: AppNextApiRequest,
  res: NextApiResponse
) => {
  const session = req.session;

  const providerId = req.query.providerId as string;
  const folderId = req.query.folderId as string;
  const search = req.query.search as string;
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

  const results = await driveManager.listFolder({
    search,
    folderId,
  });

  return {
    ...results?.data,
    files: results?.data.files?.filter(
      (each) =>
        Number(each.size || 0) <
        accountConfig[session?.user?.currentPlan || 'level_0']?.limits
          ?.maxFileSize
    ),
  };
};

handler.get(respond(listFolder));

export default handler;
