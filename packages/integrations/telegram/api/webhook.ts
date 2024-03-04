import { createApiHandler, respond } from '@chaindesk/lib/createa-api-handler';
import { AppNextApiRequest } from '@chaindesk/lib/types';
import { NextApiResponse } from 'next';
import ConversationManager from '@chaindesk/lib/conversation';
import { ApiError, ApiErrorType } from '@chaindesk/lib/api-error';
import prisma from '@chaindesk/prisma/client';
import { ConversationChannel, MessageFrom } from '@chaindesk/prisma';
import {
  AddServiceProviderTelegramSchema,
  CreateAttachmentSchema,
} from '@chaindesk/lib/types/dtos';
import handleChatMessage, {
  ChatAgentArgs,
} from '@chaindesk/lib/handle-chat-message';
import formatSourcesRawText from '@chaindesk/lib/form-sources-raw-text';
import filterInternalSources from '@chaindesk/lib/filter-internal-sources';
import axios from 'axios';
import { s3 } from '@chaindesk/lib/aws';
import accountConfig from '@chaindesk/lib/account-config';

const handler = createApiHandler();

const webhook = async (req: AppNextApiRequest, res: NextApiResponse) => {
  const [secret_key, externalId] = (
    req.headers['x-telegram-bot-api-secret-token'] as string
  )?.split('-');

  const provider = await prisma.serviceProvider.findUnique({
    where: {
      unique_external_id: {
        type: 'telegram',
        externalId,
      },
    },
    include: {
      agents: {
        include: {
          tools: true,
          organization: {
            include: {
              subscriptions: true,
              usage: true,
            },
          },
        },
      },
    },
  });

  const isPremium = !!provider!.agents[0]?.organization?.subscriptions?.length;

  if (!isPremium) {
    throw new ApiError(ApiErrorType.PREMIUM_FEATURE);
  }

  // validate the request.
  if ((provider?.config as any)?.secret_key !== secret_key) {
    throw new ApiError(ApiErrorType.UNAUTHORIZED);
  }

  const token = (provider?.config as any)?.http_token;

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

  const attachments = [] as CreateAttachmentSchema[];

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
    attachments.push({
      name: document?.file_name || 'Telegram file',
      size: document?.file_size || 0,
      mimeType: document?.mime_type || 'unknown',
      url: fileResponse?.data?.responseUrl,
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

    const { Location: url } = await s3
      .upload({
        Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME!,
        Key: media?.file_unique_id,
        Body: fileResponse.data,
        ContentType: mimeType,
      })
      .promise();

    attachments.push({
      name: media?.file_name || 'unnamed',
      size: media?.file_size || 0,
      mimeType,
      url,
    });
  }
  const query =
    (req.body?.channel_post?.text || req?.body?.channel_post?.caption) ??
    (req.body?.message?.text || req.body?.message?.caption);

  const chatId =
    req?.body?.channel_post?.chat.id ?? // channel
    req?.body?.message?.chat?.id; // direct message

  const found = await prisma.conversation.findUnique({
    where: {
      channelExternalId: `${chatId}`,
    },
    select: {
      isAiEnabled: true,
    },
  });

  // consider AI enabled if conv is not found.
  const isAiEnabled = found?.isAiEnabled ?? true;

  // do not process a media-only message.
  if (!query || !isAiEnabled) {
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
    });

    return { status: 200 };
  }

  const chatResponse = await handleChatMessage({
    agent: provider!.agents[0]! as ChatAgentArgs,
    channel: ConversationChannel.telegram,
    channelExternalId: `${chatId}`,
    channelCredentialsId: provider?.id,
    attachments,
    query,
    metadata: {
      message_id:
        req?.body?.channel_post?.message_id ?? req.body?.message?.message_id,
    },
  });

  const { answer, sources } = chatResponse?.agentResponse!;

  const finalAnswer = `${answer}\n\n${formatSourcesRawText(
    !!provider!.agents[0]?.includeSources
      ? filterInternalSources(sources || [])
      : []
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
