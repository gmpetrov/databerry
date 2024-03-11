import { NextApiResponse } from 'next/types';
import { AppNextApiRequest } from '@chaindesk/lib/types';
import {
  createAuthApiHandler,
  respond,
} from '@chaindesk/lib/createa-api-handler';

const handler = createAuthApiHandler();

export const erase = async (req: AppNextApiRequest, res: NextApiResponse) => {
  return { status: 200 };
};

handler.post(respond(erase));

export default handler;
