import { ServiceProviderType } from '@prisma/client';
import { google } from 'googleapis';
import { NextApiResponse } from 'next';

import { AppNextApiRequest } from '@app/types/index';
import { createAuthApiHandler, respond } from '@app/utils/createa-api-handler';
import { GoogleDriveManager } from '@app/utils/google-drive-manager';
import prisma from '@app/utils/prisma-client';

const handler = createAuthApiHandler();

export const auth = async (req: AppNextApiRequest, res: NextApiResponse) => {
  const session = req.session;
  const code = req.query.code as string;

  const driveManager = await GoogleDriveManager.fromCode(code);

  const userInfo = await driveManager.drive.about.get({
    fields: 'user',
  });

  await prisma.serviceProvider.create({
    data: {
      type: ServiceProviderType.google_drive,
      name: userInfo?.data?.user?.emailAddress,
      accessToken: driveManager.accessToken,
      refreshToken: driveManager.refreshToken,
      owner: {
        connect: {
          id: session?.user?.id,
        },
      },
    },
  });

  return res.redirect('/close-window');
};

handler.get(auth);

export default handler;
