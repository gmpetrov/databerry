import { NextApiResponse } from 'next';

import {
  createAuthApiHandler,
  respond,
} from '@chaindesk/lib/createa-api-handler';
import { UpdateStatusAllConversationsSchema } from '@chaindesk/lib/types/dtos';
import { AppNextApiRequest } from '@chaindesk/lib/types/index';
import validate from '@chaindesk/lib/validate';
import { ConversationChannel } from '@chaindesk/prisma';
import { prisma } from '@chaindesk/prisma/client';

const handler = createAuthApiHandler();

export async function updateStatus(
  req: AppNextApiRequest,
  res: NextApiResponse
) {
  const session = req.session;
  const data = req.body as UpdateStatusAllConversationsSchema;
  const channel = req.query.channel as ConversationChannel;
  const agentId = req.query.agentId as string;

  const result = await prisma.conversation.updateMany({
    where: {
      organizationId: session?.organization?.id,
      ...(channel ? { channel } : {}),
      ...(agentId ? { agentId } : {}),
    },
    data: {
      status: data.status,
    },
  });

  return {
    count: result.count,
  };
}

handler.post(
  validate({
    handler: respond(updateStatus),
    body: UpdateStatusAllConversationsSchema,
  })
);

export default handler;
