import { ConversationChannel } from '@prisma/client';
import Cors from 'cors';
import { NextApiResponse } from 'next';
import { z } from 'zod';

import { createApiHandler, respond } from '@chaindesk/lib/createa-api-handler';
import { client as CrispClient } from '@chaindesk/lib/crisp';
import runMiddleware from '@chaindesk/lib/run-middleware';
import { AIStatus } from '@chaindesk/lib/types/crisp';
import { AppNextApiRequest } from '@chaindesk/lib/types/index';
import validate from '@chaindesk/lib/validate';
import prisma from '@chaindesk/prisma/client';
const handler = createApiHandler();

const syncBodySchema = z.object({
  channel: z.nativeEnum(ConversationChannel),
  isAiEnabled: z.boolean(),
});

export const syncStatus = async (
  req: AppNextApiRequest,
  res: NextApiResponse
) => {
  const conversationId = req.query.conversationId as string;
  const payload = syncBodySchema.parse(req.body);

  const { channelCredentials, channelExternalId, metadata } =
    await prisma.conversation.findUniqueOrThrow({
      where: {
        id: conversationId,
      },
      include: {
        channelCredentials: true,
      },
    });
  switch (payload.channel) {
    case 'crisp':
      try {
        await CrispClient.website.updateConversationMetas(
          channelCredentials?.externalId,
          channelExternalId,
          {
            data: {
              aiStatus: payload.isAiEnabled
                ? AIStatus.enabled
                : AIStatus.disabled,
              ...(!payload.isAiEnabled ? { aiDisabledDate: new Date() } : {}),
            },
          }
        );
      } catch (e) {
        console.error(e);
        throw Error(
          `could not sync status through crisp api ${(e as any)?.message}`
        );
      }
      break;
    case 'slack':
      break;
    default:
      throw new Error('Unsupported Communication Channel.');
  }
};

handler.post(
  validate({
    handler: respond(syncStatus),
  })
);

export default handler;
