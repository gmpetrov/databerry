import { NextApiResponse } from 'next';

import { createApiHandler, respond } from '@chaindesk/lib/createa-api-handler';
import { GoogleDriveManager } from '@chaindesk/lib/google-drive-manager';
import { AppNextApiRequest } from '@chaindesk/lib/types/index';

const handler = createApiHandler();

export const auth = async (req: AppNextApiRequest, res: NextApiResponse) => {
  const driveManager = new GoogleDriveManager({});

  const url = driveManager.auth.generateAuthUrl({
    scope: ['https://www.googleapis.com/auth/drive.readonly'],
    access_type: 'offline',
    prompt: 'consent',
    response_type: 'code',
  });

  res.status(200).json({ url });
};

handler.get(auth);

export default handler;
