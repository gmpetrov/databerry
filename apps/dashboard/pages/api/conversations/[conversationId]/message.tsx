import { WebClient } from '@slack/web-api';
import Cors from 'cors';
import cuid from 'cuid';
import { NextApiResponse } from 'next';
import { z } from 'zod';

import { InboxTemplate, render } from '@chaindesk/emails';
import sendWhatsAppMessage from '@chaindesk/integrations/whatsapp/lib/send-whatsapp-message';
import { ApiError, ApiErrorType } from '@chaindesk/lib/api-error';
import ConversationManager from '@chaindesk/lib/conversation';
import {
  createLazyAuthHandler,
  respond,
} from '@chaindesk/lib/createa-api-handler';
import { client as CrispClient } from '@chaindesk/lib/crisp';
import mailer from '@chaindesk/lib/mailer';
import cors from '@chaindesk/lib/middlewares/cors';
import pipe from '@chaindesk/lib/middlewares/pipe';
import { AIStatus } from '@chaindesk/lib/types/crisp';
import {
  ConversationMetadataSlack,
  CreateAttachmentSchema,
} from '@chaindesk/lib/types/dtos';
import { AppNextApiRequest } from '@chaindesk/lib/types/index';
import validate from '@chaindesk/lib/validate';
import { ConversationChannel, MailInbox, MessageFrom } from '@chaindesk/prisma';
import prisma from '@chaindesk/prisma/client';
const handler = createLazyAuthHandler();

const chatBodySchema = z.object({
  message: z.string(),
  channel: z.nativeEnum(ConversationChannel),
  attachments: z.array(CreateAttachmentSchema).optional(),
  visitorId: z.union([z.string().cuid().nullish(), z.literal('')]),
  contactId: z.union([z.string().cuid().nullish(), z.literal('')]),
});

export const sendMessage = async (
  req: AppNextApiRequest,
  res: NextApiResponse
) => {
  const conversationId = req.query.conversationId as string;
  const payload = chatBodySchema.parse(req.body);
  const session = req.session;

  const {
    id,
    title,
    channelCredentials,
    channelExternalId,
    metadata,
    organizationId,
    organization,
    mailInbox,
    participantsUsers,
    participantsContacts,
  } = await prisma.conversation.findUniqueOrThrow({
    where: {
      id: conversationId,
    },
    include: {
      channelCredentials: true,
      organization: true,

      mailInbox: true,
      participantsUsers: session?.user?.id
        ? {
            where: {
              id: {
                not: session?.user?.id, // fetch all participants except the current user
              },
            },
          }
        : true,
      participantsContacts: true,
      messages: {
        take: 1,
        orderBy: {
          createdAt: 'desc',
        },
      },
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
            customPicture: true,
            image: true,
          },
        });

        const attachementCalls =
          payload?.attachments?.map((attachement) => {
            return CrispClient.website.sendMessageInConversation(
              channelCredentials?.externalId, // websiteId
              channelExternalId, // sessionId
              {
                type: 'file',
                from: 'operator',
                origin: 'chat',
                content: {
                  url: attachement.url,
                  name: attachement.name,
                  type: attachement.mimeType,
                },
                user: {
                  type: 'website',
                  nickname: user?.name || 'Operator',
                  avatar:
                    user?.picture ||
                    user?.customPicture ||
                    user?.image ||
                    'https://chaindesk.ai/logo.png',
                },
              }
            );
          }) || [];

        await Promise.all([
          // send text content
          CrispClient.website.sendMessageInConversation(
            channelCredentials?.externalId, // websiteId
            channelExternalId, // sessionId
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
                  user?.customPicture ||
                  user?.image ||
                  'https://chaindesk.ai/logo.png',
              },
            }
          ),
          // send attachements
          ...attachementCalls,
          // disable AI
          CrispClient.website.updateConversationMetas(
            channelCredentials?.externalId, // websiteId
            channelExternalId, // sessionId
            {
              data: {
                aiStatus: AIStatus.disabled,
                aiDisabledDate: new Date(),
              },
            }
          ),
        ]);
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
    case 'mail':
      if (payload.channel === 'mail' && !mailInbox) {
        throw new ApiError(ApiErrorType.NOT_FOUND);
      }

      let _inbox = mailInbox
        ? mailInbox
        : ({
            alias: organization?.id,
            fromName: session?.user?.name || organization?.name,
            showBranding: true,
          } as MailInbox);

      const emails: string[] = [
        ...(participantsUsers
          ?.map((each) => each?.email as string)
          .filter((each) => !!each) || []),
        ...(participantsContacts
          ?.map((c) => c?.email as string)
          .filter((each) => !!each) || []),
      ];

      if (emails.length <= 0) {
        if (payload.channel === 'mail') {
          throw new ApiError(ApiErrorType.INVALID_REQUEST);
        } else {
          break;
        }
      }

      let _channelExternalId = channelExternalId;

      if (!_channelExternalId) {
        _channelExternalId = `<${cuid()}@mail.chaindesk.ai>`;
        await prisma.conversation.update({
          where: {
            id,
          },
          data: {
            channelExternalId: _channelExternalId,
          },
        });
      }

      const subject = title || organization?.name || '💌 Request';
      const sent = await mailer.sendMail({
        inReplyTo: _channelExternalId!,
        references: [_channelExternalId],
        from: {
          name: _inbox?.fromName!,
          address:
            _inbox?.customEmail && _inbox?.isCustomEmailVerified
              ? _inbox?.customEmail
              : `${_inbox?.alias}@${process.env.INBOUND_EMAIL_DOMAIN}`,
        },
        to: emails,
        subject,
        attachments: payload.attachments?.map((each) => ({
          filename: each.name!,
          contentType: each.mimeType!,
          path: each.url!,
        })),
        html: render(
          <InboxTemplate
            title={subject}
            message={payload.message}
            signature={_inbox?.signature!}
            showBranding={!!_inbox?.showBranding}
          />
        ),
      });

      break;
    case 'whatsapp':
      try {
        await sendWhatsAppMessage({
          to: channelExternalId!,
          credentials: channelCredentials as any,
          message: {
            type: 'text',
            text: {
              body: payload.message!,
            },
          },
        });

        if (payload.attachments?.length) {
          await Promise.all(
            payload.attachments.map((each) => {
              const isVideo = each.mimeType?.includes('video');
              const isImage = each.mimeType?.includes('image');
              const isAudio = each.mimeType?.includes('audio');

              let message = {};

              if (isVideo) {
                message = {
                  type: 'video',
                  video: {
                    link: each.url,
                  },
                };
              } else if (isImage) {
                message = {
                  type: 'image',
                  image: {
                    link: each.url,
                  },
                };
              } else if (isAudio) {
                message = {
                  type: 'audio',
                  audio: {
                    link: each.url,
                  },
                };
              } else {
                message = {
                  type: 'document',
                  document: {
                    link: each.url,
                  },
                };
              }

              return sendWhatsAppMessage({
                to: channelExternalId!,
                credentials: channelCredentials as any,
                message: message as any,
              });
            })
          );
        }
      } catch (e) {
        console.error(e);
        throw Error(
          `could not send message through whatsapp ${(e as any)?.message}`
        );
      }
      break;
    default:
      throw new Error('Unsupported Communication Channel.');
  }

  const conversationManager = new ConversationManager({
    organizationId: organizationId!,
    conversationId: conversationId,
    channel: payload.channel as ConversationChannel,
    // if the user is not logged in, then the conversation is in the human requested state
    // This way we not miss messages sent on resovled conversations
    // status: !session?.user?.id ? ConversationStatus.HUMAN_REQUESTED : undefined,
  });

  const answerMsgId = cuid();

  const conv = await conversationManager.createMessage({
    id: answerMsgId,
    from: MessageFrom.human,
    text: payload.message,
    attachments: payload.attachments,

    contactId: payload.contactId!,
    visitorId: payload.visitorId!,
    userId: !!(payload.visitorId || payload.contactId)
      ? undefined
      : session?.user?.id,
  });

  return conv;
};

handler.post(
  validate({
    handler: respond(sendMessage),
  })
);

export default pipe(cors({ methods: ['POST', 'HEAD'] }), handler);
