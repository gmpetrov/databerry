import formatSourcesRawText from '@chaindesk/lib/form-sources-raw-text';
import {
  ServiceProviderWhatsappSchema,
  WhatsAppSendMessagechema,
} from '@chaindesk/lib/types/dtos';
import { NextApiResponse } from 'next';

import { ApiError, ApiErrorType } from '@chaindesk/lib/api-error';
import { createApiHandler } from '@chaindesk/lib/createa-api-handler';
import { AppNextApiRequest } from '@chaindesk/lib/types';
import prisma from '@chaindesk/prisma/client';
import cuid from 'cuid';
import ConversationManager from '@chaindesk/lib/conversation';
import { ConversationChannel, MessageFrom } from '@chaindesk/prisma';
import AgentManager from '@chaindesk/lib/agent';
import filterInternalSources from '@chaindesk/lib/filter-internal-sources';
import { sendWhatsAppMessage } from '../lib/send-whatsapp-message';

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

  console.log('PAYLOIAD-->', payload);
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
          take: 1,
          include: {
            tools: {
              include: {
                datastore: true,
                form: true,
              },
            },
            conversations: {
              take: 1,
              where: {
                channelExternalId,
              },
              include: {
                messages: {
                  take: -24,
                  orderBy: {
                    createdAt: 'asc',
                  },
                },
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
    const message = payload.entry[0].changes[0].value.messages[0];

    const conversationManager = new ConversationManager({
      organizationId: agent?.organizationId!,
      channel: ConversationChannel.whatsapp,
      conversationId,
      channelExternalId,
      channelCredentialsId: credentials?.id,
    });

    if (!appContact) {
      appContact = await prisma.contact.create({
        data: {
          externalId: waContactId!,
          organizationId: agent?.organizationId!,
          firstName: waContactName,
        },
      });
    }

    if (message?.type === 'text') {
      await conversationManager.createMessage({
        from: MessageFrom.human,
        text: message?.text?.body,

        contactId: appContact?.id,
        // externalVisitorId: sessionId,
      });

      if (conversation && !conversation?.isAiEnabled) {
        // AI is disabled
        return res.send('ok');
      }

      const { answer, sources } = await new AgentManager({ agent }).query({
        input: message?.text?.body,
        history: conversation?.messages || [],
      });

      const finalAnswer = `${answer}\n\n${formatSourcesRawText(
        filterInternalSources(sources || [])!
      )}`.trim();

      await conversationManager.createMessage({
        from: MessageFrom.agent,
        text: finalAnswer,
        agentId: agent?.id,
        sources,
      });

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

    return res.send('ok');
  } else {
    console.log('Not implemented yet ------------------>');
    return res.send('not implemented yet');
  }
};

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
        messages: WhatsAppSendMessagechema[];
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
