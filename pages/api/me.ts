import { NextApiResponse } from 'next';

import { AppNextApiRequest } from '@app/types/index';
import { createAuthApiHandler, respond } from '@app/utils/createa-api-handler';

const handler = createAuthApiHandler();

export const me = async (req: AppNextApiRequest, res: NextApiResponse) => {
  const session = req.session;

  return session.user;
};

handler.get(respond(me));

export default handler;
