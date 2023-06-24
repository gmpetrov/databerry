import { NextApiResponse } from 'next';

import { AppNextApiRequest } from '@app/types/index';
import { createApiHandler, respond } from '@app/utils/createa-api-handler';
import { GoogleDriveManager } from '@app/utils/google-drive-manager';

const handler = createApiHandler();

export const auth = async (req: AppNextApiRequest, res: NextApiResponse) => {
  const driveManager = new GoogleDriveManager({});

  const authUrl = driveManager.auth.generateAuthUrl({
    scope: ['https://www.googleapis.com/auth/drive.readonly'],
    access_type: 'offline',
    prompt: 'consent',
    response_type: 'code',
  });

  res.status(200).json({ authUrl });
};

handler.get(auth);

export default handler;
