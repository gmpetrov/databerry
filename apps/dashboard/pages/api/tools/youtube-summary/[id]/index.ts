import { NextApiResponse } from 'next';

import {
  createLazyAuthHandler,
  respond,
} from '@chaindesk/lib/createa-api-handler';
import cors from '@chaindesk/lib/middlewares/cors';
import pipe from '@chaindesk/lib/middlewares/pipe';
import { AppNextApiRequest } from '@chaindesk/lib/types';
import { LLMTaskOutputType } from '@chaindesk/prisma';
import { prisma } from '@chaindesk/prisma/client';

const handler = createLazyAuthHandler();

export const getSummary = async (
  req: AppNextApiRequest,
  res: NextApiResponse
) => {
  const id = req.query.id as string;

  const output = await prisma.lLMTaskOutput.findUnique({
    where: {
      unique_external_id: {
        type: LLMTaskOutputType.youtube_summary,
        externalId: id,
      },
    },
  });

  return output;
};

handler.get(respond(getSummary));

export default pipe(cors({ methods: ['GET', 'HEAD'] }), handler);
