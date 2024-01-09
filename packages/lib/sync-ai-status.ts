import { ConversationChannel } from '@prisma/client';
import { z } from 'zod';

import { client as CrispClient } from '@chaindesk/lib/crisp';
import { AIStatus } from '@chaindesk/lib/types/crisp';
import { AppNextApiRequest } from '@chaindesk/lib/types/index';
import prisma from '@chaindesk/prisma/client';

const syncBodySchema = z.object({
  conversationId: z.string().cuid(),
  channel: z.nativeEnum(ConversationChannel),
  isAiEnabled: z.boolean(),
});

export const syncAiStatus = async (props: z.infer<typeof syncBodySchema>) => {
  const payload = syncBodySchema.parse(props);
  const conversationId = payload.conversationId;

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
      console.log("channel doesn't support sync");
  }
};

export default syncAiStatus;
