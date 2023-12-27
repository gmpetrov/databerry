import { WebClient } from '@slack/web-api';
import Cors from 'cors';
import cuid from 'cuid';
import { NextApiResponse } from 'next';
import { z } from 'zod';

import ConversationManager from '@chaindesk/lib/conversation';
import {
  createAuthApiHandler,
  respond,
} from '@chaindesk/lib/createa-api-handler';
import { client as CrispClient } from '@chaindesk/lib/crisp';
import runMiddleware from '@chaindesk/lib/run-middleware';
import { AIStatus } from '@chaindesk/lib/types/crisp';
import { ConversationMetadataSlack } from '@chaindesk/lib/types/dtos';
import { AppNextApiRequest } from '@chaindesk/lib/types/index';
import validate from '@chaindesk/lib/validate';
import { ConversationChannel, MessageFrom } from '@chaindesk/prisma';
import prisma from '@chaindesk/prisma/client';
const handler = createAuthApiHandler();

const chatBodySchema = z.object({
  message: z.string(),
  channel: z.nativeEnum(ConversationChannel),
});

export const sendMessage = async (
  req: AppNextApiRequest,
  res: NextApiResponse
) => {
  const conversationId = req.query.conversationId as string;
  const payload = chatBodySchema.parse(req.body);
  const session = req.session;

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
        const user = await prisma.user.findUnique({
          where: {
            id: session?.user?.id,
          },
          select: {
            name: true,
            picture: true,
          },
        });
        await CrispClient.website.sendMessageInConversation(
          channelExternalId,
          channelCredentials?.id,
          {
            type: 'text',
            from: 'operator',
            origin: 'chat',
            content: payload.message,
            user: {
              type: 'website',
              nickname: user?.name || 'Operator',
              avatar:
                user?.picture ||
                'https://chaindesk.ai/app-rounded-bg-white.png',
            },
          }
        );

        // disable AI
        await CrispClient.website.updateConversationMetas(
          channelExternalId,
          channelCredentials?.id,
          {
            data: {
              aiStatus: AIStatus.disabled,
              aiDisabledDate: new Date(),
            },
          }
        );
      } catch (e) {
        console.error(e);
        throw Error(
          `could not send message through crisp api ${(e as any)?.message}`
        );
      }
      break;
    case 'slack':
      try {
        if (!channelCredentials?.accessToken) {
          throw new Error(
            'Fatal: slack service provider is missing accessToken'
          );
        }

        const slackClient = new WebClient(channelCredentials?.accessToken);

        await slackClient.chat.postMessage({
          channel: channelExternalId!,
          text: `<@${(metadata as ConversationMetadataSlack)?.user_id}> ${
            payload.message
          }`,
        });
      } catch (e) {
        console.error(e);
        throw Error(
          `could not send message through slack api ${(e as any)?.message}`
        );
      }
      break;
    case 'website':
      // no special treatement for website channel.
      break;
    default:
      throw new Error('Unsupported Communication Channel.');
  }

  const conversationManager = new ConversationManager({
    organizationId: session.organization.id as string,
    conversationId: conversationId,
    channel: payload.channel as ConversationChannel,
    userId: session.user?.id,
  });

  const answerMsgId = cuid();

  conversationManager.push({
    id: answerMsgId,
    from: MessageFrom.human,
    text: payload.message,
  });

  await conversationManager.save();
};

handler.post(
  validate({
    handler: respond(sendMessage),
  })
);

export default handler;
