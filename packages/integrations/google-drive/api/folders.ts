import { NextApiResponse } from 'next';

import accountConfig from '@chaindesk/lib/account-config';
import { ApiError, ApiErrorType } from '@chaindesk/lib/api-error';
import {
  createAuthApiHandler,
  respond,
} from '@chaindesk/lib/createa-api-handler';
import { GoogleDriveManager } from '@chaindesk/lib/google-drive-manager';
import { AppNextApiRequest } from '@chaindesk/lib/types/index';
import { prisma } from '@chaindesk/prisma/client';

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

  if (provider?.organizationId !== session?.organization?.id) {
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
        accountConfig[session?.organization?.currentPlan || 'level_0']?.limits
          ?.maxFileSize
    ),
  };
};

handler.get(respond(listFolder));

export default handler;
