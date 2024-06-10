import { createApiHandler, respond } from '@chaindesk/lib/createa-api-handler';
import { AppNextApiRequest } from '@chaindesk/lib/types';
import cuid from 'cuid';
import { NextApiResponse } from 'next';
import ConversationManager from '@chaindesk/lib/conversation';
import { ApiError, ApiErrorType } from '@chaindesk/lib/api-error';
import prisma from '@chaindesk/prisma/client';
import { ConversationChannel } from '@chaindesk/prisma';
import { creatChatUploadKey } from '@chaindesk/lib/file-upload';
import getFileExtFromMimeType from '@chaindesk/lib/get-file-ext-from-mime-type';
import { CreateAttachmentSchema } from '@chaindesk/lib/types/dtos';
import handleChatMessage, {
  ChatAgentArgs,
  ChatConversationArgs,
} from '@chaindesk/lib/handle-chat-message';
import formatSourcesRawText from '@chaindesk/lib/form-sources-raw-text';
import filterInternalSources from '@chaindesk/lib/filter-internal-sources';
import axios from 'axios';
import { s3 } from '@chaindesk/lib/aws';
import accountConfig from '@chaindesk/lib/account-config';

const handler = createApiHandler();

type ExtendedAttachmentSchema = CreateAttachmentSchema & {
  messageId?: string;
  conversationId?: string;
};

const webhook = async (req: AppNextApiRequest, res: NextApiResponse) => {
  const [secret_key, externalId] = (
    req.headers['x-telegram-bot-api-secret-token'] as string
  )?.split('-');
  const message = req.body?.message as {
    message_id: number;
    from: {
      id: number;
      is_bot: boolean;
      first_name: string;
      last_name: string;
    };
    media_group_id?: string;
  };

  const provider = await prisma.serviceProvider.findUnique({
    where: {
      unique_external_id: {
        type: 'telegram',
        externalId,
      },
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
              externalId: `${message?.from?.id}`,
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
              channelExternalId: externalId,
            },
          },
        },
      },
    },
  });

  let newContact = null;
  if (message) {
    const existingContact = await prisma.contact.findUnique({
      where: {
        unique_external_id_for_org: {
          externalId: `${message?.from?.id}`,
          organizationId: provider?.organizationId!,
        },
      },
    });

    if (!existingContact) {
      newContact = await prisma.contact.create({
        data: {
          externalId: `${message?.from?.id}`,
          firstName: message?.from?.first_name,
          lastName: message?.from?.last_name,
          organization: {
            connect: {
              id: provider?.organizationId!,
            },
          },
        },
      });
    }
  }

  const agent = provider!.agents[0];

  const chatId =
    req?.body?.channel_post?.chat?.id ?? req?.body?.message?.chat?.id;

  let conversation = await prisma.conversation.findUnique({
    where: {
      channelExternalId: `${chatId}`,
    },
    ...ChatConversationArgs,
  });

  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: {
        channelExternalId: `${chatId}`,
        organizationId: provider?.organizationId!,
      },
      ...ChatConversationArgs,
    });
  }

  const conversationManager = new ConversationManager({
    channel: ConversationChannel.telegram,
    conversationId: conversation.id,
    organizationId: provider?.organizationId!,
    channelCredentialsId: provider?.id,
    channelExternalId: `${chatId}`,
    metadata: {
      message_id:
        req?.body?.channel_post?.message_id ?? req.body?.message?.message_id,
    },
  });

  const isPremium = (provider?.organization?.subscriptions?.length || 0) > 0;

  if (!isPremium) {
    throw new ApiError(ApiErrorType.PREMIUM_FEATURE);
  }

  // validate the request.
  if ((provider?.config as any)?.secret_key !== secret_key) {
    throw new ApiError(ApiErrorType.UNAUTHORIZED);
  }

  const token = (provider?.config as any)?.http_token;

  const media_group_id = (req.body?.message || req.body?.channel_post)
    ?.media_group_id;
  const photo =
    req.body?.message?.photo?.[1] ?? req.body?.channel_post?.photo?.[1];

  const sticker =
    req.body?.message?.sticker?.thumbnail ??
    req.body?.channel_post?.sticker?.thumbnail;

  const voice = req.body?.message?.voice ?? req.body?.channel_post?.voice;

  const video = req.body?.message?.video ?? req.body?.channel_post?.video;

  let media = photo || sticker || voice || video;

  const document =
    req.body?.message?.document ?? req.body?.channel_post?.document;

  const maxFileSize =
    provider?.agents?.[0]?.organization?.subscriptions?.reduce(
      (max, subscription) => {
        const maxSize =
          accountConfig[subscription.plan as keyof typeof accountConfig]?.limits
            ?.maxFileSize || 0;
        return Math.max(max, maxSize);
      },
      0
    ) || 0;

  // crush big media.
  if (media?.file_size > maxFileSize) {
    media = undefined;
  }

  const attachments = [] as ExtendedAttachmentSchema[];

  // trick: use telegram storage for documents.
  if (document) {
    const { data: fileData } = await axios.get(
      `https://api.telegram.org/bot${token}/getFile?file_id=${document.file_id}`
    );
    const fileUrl = `https://api.telegram.org/file/bot${token}/${fileData.result.file_path}`;
    const fileResponse = await axios({
      url: fileUrl,
      method: 'GET',
      responseType: 'stream',
    });

    const fileName = `${cuid()}.${getFileExtFromMimeType(document?.mime_type)}`;

    attachments.push({
      name: document?.file_name || fileName,
      size: document?.file_size || 0,
      mimeType: document?.mime_type || 'unknown',
      url: fileResponse?.data?.responseUrl,
      conversationId: conversation.id,
    });
  } else if (media) {
    const file_id = media?.file_id;
    const mimeType =
      sticker || photo ? 'image/jpeg' : (voice || video)?.mime_type;

    const { data: fileData } = await axios.get(
      `https://api.telegram.org/bot${token}/getFile?file_id=${file_id}`
    );

    const fileUrl = `https://api.telegram.org/file/bot${token}/${fileData?.result?.file_path}`;
    const fileResponse = await axios({
      url: fileUrl,
      method: 'GET',
      responseType: 'stream',
    });

    const fileName = `${cuid()}.${getFileExtFromMimeType(mimeType)}`;

    const fileKey = creatChatUploadKey({
      organizationId: agent?.organizationId!,
      conversationId: conversation?.id,
      fileName,
    });
    const s3FileUrl = `${process.env.NEXT_PUBLIC_AWS_ENDPOINT!}/${fileKey}`;

    await s3
      .upload({
        Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME!,
        Key: fileKey,
        Body: fileResponse.data,
        ContentType: mimeType,
      })
      .promise();

    attachments.push({
      name: media?.file_name || fileName,
      size: media?.file_size || 0,
      mimeType,
      url: s3FileUrl,
      conversationId: conversation?.id,
    });
  }

  const query =
    (req.body?.channel_post?.text || req?.body?.channel_post?.caption) ??
    (req.body?.message?.text || req.body?.message?.caption);

  // update message attachments if it's linked to a media group.
  if (media_group_id && attachments?.length > 0) {
    const msg = await prisma.message.findFirst({
      where: {
        conversation: {
          organizationId: provider?.organizationId!,
        },
        externalId: media_group_id,
      },
    });

    if (msg) {
      await prisma.message.update({
        where: {
          id: msg.id,
        },
        data: {
          attachments: {
            createMany: {
              data: attachments,
            },
          },
        },
      });
      return { status: 200 };
    }
  }

  // consider AI enabled if conv is not found.
  const isAiEnabled = conversation?.isAiEnabled ?? true;

  if (!isAiEnabled) {
    const conversationManager = new ConversationManager({
      channelExternalId: `${chatId}`,
      channel: ConversationChannel.telegram,
      organizationId: provider?.organizationId!,
      channelCredentialsId: provider?.id,
      metadata: {
        message_id:
          req?.body?.channel_post?.message_id ?? req.body?.message?.message_id,
      },
    });

    await conversationManager.createMessage({
      attachments,
      from: 'human',
      text: query ?? '',
      externalId: media_group_id,
    });
  }

  const chatResponse = await handleChatMessage({
    agent,
    channel: ConversationChannel.telegram,
    conversation,
    channelExternalId: `${chatId}`,
    channelCredentialsId: provider?.id,
    attachments,
    externalMessageId: media_group_id,
    contactId: newContact?.id,
    query: query ?? '',
  });

  const { answer, sources } = chatResponse?.agentResponse!;

  const finalAnswer = `${answer}\n\n${formatSourcesRawText(
    agent?.includeSources ? filterInternalSources(sources || []) : []
  )}`.trim();

  await axios.post(`https://api.telegram.org/bot${token}/sendMessage`, {
    text: finalAnswer,
    chat_id: `${chatId}`,
    reply_parameters: {
      message_id:
        req?.body?.channel_post?.message_id ?? req.body?.message?.message_id,
    },
  });

  return { status: 200 };
};

handler.post(respond(webhook));

export default handler;
