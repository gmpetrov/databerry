import { NextApiResponse } from 'next';
import defaultAgentHandler from '../../_utils/default-agent-hanlder';

import { AppNextApiRequest } from '@chaindesk/lib/types/index';
import { IntegrationType } from '@chaindesk/prisma';

const handler = (req: AppNextApiRequest, res: NextApiResponse) => {
  req.query['type'] = IntegrationType.slack;
  return defaultAgentHandler(req, res);
};

export default handler;
