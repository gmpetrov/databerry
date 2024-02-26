import axios from 'axios';
import cuid from 'cuid';
import { NextApiResponse } from 'next';
import pMap from 'p-map';

import AgentManager from '@chaindesk/lib/agent';
import { ApiError, ApiErrorType } from '@chaindesk/lib/api-error';
import { s3 } from '@chaindesk/lib/aws';
import ConversationManager from '@chaindesk/lib/conversation';
import { createApiHandler } from '@chaindesk/lib/createa-api-handler';
import { creatChatUploadKey } from '@chaindesk/lib/file-upload';
import filterInternalSources from '@chaindesk/lib/filter-internal-sources';
import formatSourcesRawText from '@chaindesk/lib/form-sources-raw-text';
import getFileExtFromMimeType from '@chaindesk/lib/get-file-ext-from-mime-type';
import handleChatMessage, {
  ChatAgentArgs,
  ChatConversationArgs,
} from '@chaindesk/lib/handle-chat-message';
import { AppNextApiRequest } from '@chaindesk/lib/types';
import {
  CreateAttachmentSchema,
  ServiceProviderWhatsappSchema,
  WhatsAppReceivedMessageMediaSchema,
  WhatsAppReceivedMessageSchema,
  WhatsAppReceivedMessageTextSchema,
} from '@chaindesk/lib/types/dtos';
import {
  ConversationChannel,
  ConversationStatus,
  MessageFrom,
} from '@chaindesk/prisma';
import prisma from '@chaindesk/prisma/client';

import { sendWhatsAppMessage } from '../lib/send-whatsapp-message';
import getRequestLocation from '@chaindesk/lib/get-request-location';

interface notionSuccessResponse {
  access_token: string;
  bot_id: string;
  duplicated_template_id: string | null;
  owner: {
    workspace: boolean;
  };
  workspace_icon: string;
  workspace_id: string;
  workspace_name: string;
}

const handler = createApiHandler();

export const validate = async (
  req: AppNextApiRequest,
  res: NextApiResponse
) => {
  const id = req.query.service_provider_id as string;
  const mode = req.query['hub.mode'] as string;
  const challenge = req.query['hub.challenge'] as string;
  const verifyToken = req.query['hub.verify_token'] as string;

  if (!id) {
    throw new ApiError(ApiErrorType.INVALID_REQUEST);
  }

  const credentials = await prisma.serviceProvider.findUnique({
    where: {
      id,
    },
  });

  if (!credentials) {
    throw new ApiError(ApiErrorType.NOT_FOUND);
  }

  if (
    mode !== 'subscribe' ||
    verifyToken !==
      (credentials?.config as ServiceProviderWhatsappSchema['config'])
        ?.webhookVerifyToken
  ) {
    throw new ApiError(ApiErrorType.UNAUTHORIZED);
  }

  return res.send(challenge);
};

handler.get(validate);

export const webhook = async (req: AppNextApiRequest, res: NextApiResponse) => {
  const payload = req.body as WhatsAppWebhookPayload;
  const providerId = req.query.service_provider_id as string;

  console.log('PAYLOIAD-->', JSON.stringify(payload, null, 2));
  console.log('providerId-->', providerId);

  if (!providerId) {
    throw new ApiError(ApiErrorType.INVALID_REQUEST);
  }

  const field = payload.entry[0].changes[0].field;

  if (field === 'messages') {
    const contact = payload?.entry?.[0]?.changes?.[0]?.value?.contacts?.[0];
    const waContactId = contact?.wa_id;
    const waContactName = contact?.profile?.name;
    const channelExternalId = waContactId;

    const credentials = await prisma.serviceProvider.findUnique({
      where: {
        type: 'whatsapp',
        id: providerId,
      },
      include: {
        organization: {
          include: {
            subscriptions: {
              where: {
                status: {
                  in: ['active', 'trialing'],
                },
              },
            },
            contacts: {
              where: {
                externalId: waContactId,
              },
            },
          },
        },
        agents: {
          ...ChatAgentArgs,
          take: 1,
          include: {
            ...ChatAgentArgs.include,
            conversations: {
              ...ChatConversationArgs,
              take: 1,
              where: {
                channelExternalId,
              },
            },
          },
        },
      },
    });

    const isPremium = !!credentials?.organization?.subscriptions?.length;

    if (!isPremium) {
      throw new ApiError(ApiErrorType.PREMIUM_FEATURE);
    }

    if (!credentials) {
      throw new ApiError(ApiErrorType.NOT_FOUND);
    }

    const agent = credentials?.agents?.[0];

    if (!agent) {
      throw new ApiError(ApiErrorType.NOT_FOUND);
    }

    const conversation = agent?.conversations?.[0];
    const conversationId = conversation?.id || cuid();
    let appContact = credentials?.organization?.contacts?.[0];

    // Create a single message from all text messages
    const textMessages = payload.entry
      .map((entry) =>
        entry.changes
          .map((change) =>
            (change?.value?.messages as WhatsAppReceivedMessageTextSchema[])
              ?.filter((each) => each?.type === 'text')
              ?.map((each: WhatsAppReceivedMessageTextSchema) => each.text.body)
              .flat()
          )
          .flat()
      )
      .flat()
      .filter((each) => !!each);

    const files = payload.entry
      .map((entry) =>
        entry.changes
          .map((change) =>
            change?.value?.messages
              ?.filter((each) =>
                ['image', 'video', 'audio', 'document'].includes(each?.type)
              )
              ?.map((each) => {
                const item = each as Extract<
                  WhatsAppReceivedMessageMediaSchema,
                  { type: 'image' }
                >;

                return item?.[item.type];
              })
              .flat()
          )
          .flat()
      )
      .flat()
      .filter((each) => !!each);

    const captionsText = files
      .map((each) => each.caption)
      .filter((each) => !!each)
      .join('\n')
      .trim();

    const msgText = `${textMessages.join('\n\n')}\n${captionsText}`.trim();
    console.log('Msg-->', msgText);

    const attachments = [] as CreateAttachmentSchema[];

    if (files.length > 0) {
      await pMap(
        files,
        async (file) => {
          try {
            const { data } = await axios.get<{
              messaging_product: 'whatsapp';
              url: string;
              mime_type: string;
              sha256: string;
              file_size: string;
              id: string;
            }>(`https://graph.facebook.com/v19.0/${file.id}`, {
              headers: {
                Authorization: `Bearer ${credentials?.accessToken}`,
              },
            });

            const downloaded = await axios.get(data.url, {
              headers: {
                Authorization: `Bearer ${credentials?.accessToken}`,
                'Content-Type': file.mime_type,
              },
              responseType: 'arraybuffer',
            });

            const fileName = `${data.id}.${getFileExtFromMimeType(
              file.mime_type
            )}`;
            const fileKey = creatChatUploadKey({
              organizationId: agent?.organizationId!,
              conversationId,
              fileName: `${data.id}.${getFileExtFromMimeType(file.mime_type)}`,
            });

            await s3
              .putObject({
                Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME!,
                Key: fileKey,
                Body: Buffer.from(downloaded.data, 'binary'),
                ContentType: file.mime_type,
              })
              .promise();

            attachments.push({
              name: file.caption || fileName,
              url: `${process.env.NEXT_PUBLIC_AWS_ENDPOINT}/${fileKey}`,
              size: Number(data.file_size),
              mimeType: file.mime_type,
            });
          } catch (err) {
            console.log('whatsapp upload attachment error', err);
          }
        },
        {
          concurrency: 4,
        }
      );
    }

    if (!appContact) {
      appContact = await prisma.contact.create({
        data: {
          externalId: waContactId!,
          organizationId: agent?.organizationId!,
          firstName: waContactName,
          metadata: getRequestLocation(req),
        },
      });
    }

    if (msgText || attachments.length > 0) {
      const chatResponse = await handleChatMessage({
        logger: req.logger,
        channel: ConversationChannel.whatsapp,
        agent: agent!,
        conversation: conversation!,
        query: msgText || '🧷',
        contactId: appContact?.id,
        attachments,
        channelExternalId,
        channelCredentialsId: credentials?.id,
        location: getRequestLocation(req),
      });

      if (chatResponse?.agentResponse) {
        const { answer, sources } = chatResponse?.agentResponse;

        const finalAnswer = `${answer}\n\n${formatSourcesRawText(
          !!agent?.includeSources ? filterInternalSources(sources || []) : []
        )}`.trim();

        console.log('agent-->', agent);
        console.log('finalAnswer-->', finalAnswer);

        const response = await sendWhatsAppMessage({
          to: waContactId,
          message: {
            type: 'text',
            text: {
              body: finalAnswer,
            },
          },
          credentials: credentials as any,
        });

        const phoneNumber = response?.data?.contacts?.[0]?.input;

        if (phoneNumber && !appContact?.phoneNumber) {
          const contactWithPhoneNumber = await prisma.contact.findUnique({
            where: {
              unique_phone_number_for_org: {
                phoneNumber,
                organizationId: agent?.organizationId!,
              },
            },
          });

          if (contactWithPhoneNumber) {
            // a contact with this phone number already exists so we need to delete the contact created earlier and update the input message with the new contact id
            await prisma.$transaction([
              prisma.message.update({
                where: {
                  id: chatResponse?.inputMessageId,
                },
                data: {
                  contact: {
                    connect: {
                      id: contactWithPhoneNumber.id,
                    },
                  },
                },
              }),
              prisma.contact.delete({
                where: {
                  id: appContact?.id,
                },
              }),
            ]);
          } else {
            await prisma.contact.update({
              where: {
                id: appContact?.id,
              },
              data: {
                phoneNumber,
                externalId: waContactId!,
              },
            });
          }
        }
      }
    }

    return res.send('ok');
  } else {
    console.log('Not implemented yet ------------------>');
    return res.send('not implemented yet');
  }
};

handler.post(webhook);

export default handler;

export type WhatsAppWebhookPayload = {
  object: 'whatsapp_business_account';
  entry: {
    id: string;
    changes: {
      field: 'messages';
      value: {
        messaging_product: 'whatsapp';
        metadata: {
          display_phone_number: string;
          phone_number_id: string;
        };
        contacts: {
          profile: {
            name: string;
          };
          wa_id: string;
        }[];
        messages: WhatsAppReceivedMessageSchema[];
      };
    }[];
  }[];
};

// https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks/payload-examples/
// TEXT MESSAGE
// {
//   "object": "whatsapp_business_account",
//   "entry": [{
//       "id": "WHATSAPP_BUSINESS_ACCOUNT_ID",
//       "changes": [{
//           "value": {
//               "messaging_product": "whatsapp",
//               "metadata": {
//                   "display_phone_number": PHONE_NUMBER,
//                   "phone_number_id": PHONE_NUMBER_ID
//               },
//               "contacts": [{
//                   "profile": {
//                     "name": "NAME"
//                   },
//                   "wa_id": PHONE_NUMBER
//                 }],
//               "messages": [{
//                   "from": PHONE_NUMBER,
//                   "id": "wamid.ID",
//                   "timestamp": TIMESTAMP,
//                   "text": {
//                     "body": "MESSAGE_BODY"
//                   },
//                   "type": "text"
//                 }]
//           },
//           "field": "messages"
//         }]
//   }]
// }

// Media Message
// {
//   "object": "whatsapp_business_account",
//   "entry": [{
//       "id": "WHATSAPP_BUSINESS_ACCOUNT_ID",
//       "changes": [{
//           "value": {
//               "messaging_product": "whatsapp",
//               "metadata": {
//                   "display_phone_number": PHONE_NUMBER,
//                   "phone_number_id": PHONE_NUMBER_ID
//               },
//               "contacts": [{
//                   "profile": {
//                     "name": "NAME"
//                   },
//                   "wa_id": "WHATSAPP_ID"
//                 }],
//               "messages": [{
//                   "from": PHONE_NUMBER,
//                   "id": "wamid.ID",
//                   "timestamp": TIMESTAMP,
//                   "type": "image",
//                   "image": {
//                     "caption": "CAPTION",
//                     "mime_type": "image/jpeg",
//                     "sha256": "IMAGE_HASH",
//                     "id": "ID"
//                   }
//                 }]
//           },
//           "field": "messages"
//         }]
//     }]
// }

// Sticker Message
// {
//   "object": "whatsapp_business_account",
//   "entry": [
//     {
//       "id": "ID",
//       "changes": [
//         {
//           "value": {
//             "messaging_product": "whatsapp",
//             "metadata": {
//               "display_phone_number": "PHONE_NUMBER",
//               "phone_number_id": "PHONE_NUMBER_ID"
//             },
//             "contacts": [
//               {
//                 "profile": {
//                   "name": "NAME"
//                 },
//                 "wa_id": "ID"
//               }
//             ],
//             "messages": [
//               {
//                 "from": "SENDER_PHONE_NUMBER",
//                 "id": "wamid.ID",
//                 "timestamp": "TIMESTAMP",
//                 "type": "sticker",
//                 "sticker": {
//                   "mime_type": "image/webp",
//                   "sha256": "HASH",
//                   "id": "ID"
//                 }
//               }
//             ]
//           },
//           "field": "messages"
//         }
//       ]
//     }
//   ]
// }

// Unknown Messages
// {
//   "object": "whatsapp_business_account",
//   "entry": [{
//       "id": "WHATSAPP_BUSINESS_ACCOUNT_ID",
//       "changes": [{
//           "value": {
//               "messaging_product": "whatsapp",
//               "metadata": {
//                 "display_phone_number": "PHONE_NUMBER",
//                 "phone_number_id": "PHONE_NUMBER_ID"
//               },
//               "contacts": [{
//                   "profile": {
//                     "name": "NAME"
//                   },
//                   "wa_id": "WHATSAPP_ID"
//                 }],
//               "messages": [{
//                   "from": "PHONE_NUMBER",
//                   "id": "wamid.ID",
//                   "timestamp": "TIMESTAMP",
//                   "errors": [
//                     {
//                       "code": 131051,
//                       "details": "Message type is not currently supported",
//                       "title": "Unsupported message type"
//                     }],
//                    "type": "unknown"
//                    }]
//             }
//             "field": "messages"
//         }],
//     }]
// }
