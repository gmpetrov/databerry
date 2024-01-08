import { S3 } from 'aws-sdk';
import cuid from 'cuid';
import mime from 'mime-types';
import { NextApiResponse } from 'next';
import pMap from 'p-map';

import { ApiError, ApiErrorType } from '@chaindesk/lib/api-error';
import { createApiHandler, respond } from '@chaindesk/lib/createa-api-handler';
import mailparser from '@chaindesk/lib/mail-parser';
import { AppNextApiRequest } from '@chaindesk/lib/types/index';
import validate from '@chaindesk/lib/validate';
import {
  Attachment,
  ConversationChannel,
  MessageFrom,
  Prisma,
} from '@chaindesk/prisma';
import { prisma } from '@chaindesk/prisma/client';

export const s3 = new S3({
  signatureVersion: 'v4',
  accessKeyId: process.env.INBOUND_EMAIL_AWS_ACCESS_KEY,
  secretAccessKey: process.env.INBOUND_EMAIL_AWS_SECRET_KEY,
  region: process.env.INBOUND_EMAIL_AWS_REGION,
  ...(process.env.INBOUND_EMAIL_AWS_S3_ENDPOINT
    ? {
        endpoint: process.env.INBOUND_EMAIL_AWS_S3_ENDPOINT,
        s3ForcePathStyle:
          process.env.INBOUND_EMAIL_APP_AWS_S3_FORCE_PATH_STYLE === 'true',
      }
    : {}),
});

const handler = createApiHandler();

const clean = async ({ notificationId }: { notificationId: string }) => {
  return s3
    .deleteObject({
      Bucket: process.env.INBOUND_EMAIL_BUCKET as string,
      Key: `emails/${notificationId}`,
    })
    .promise();
};

export async function inboundWebhook(
  req: AppNextApiRequest,
  res: NextApiResponse
) {
  console.log(
    'REQ.BODY =--================>',
    JSON.stringify(req.body, null, 2)
  );

  const notification = req.body?.Records?.[0]?.ses;
  const notificationId = notification?.mail?.messageId as string;

  if (!notificationId) {
    throw new ApiError(ApiErrorType.INVALID_REQUEST);
  }

  const obj = await s3
    .getObject({
      Bucket: process.env.INBOUND_EMAIL_BUCKET as string,
      Key: `emails/${notificationId}`,
    })
    .promise();

  const mail = await mailparser.simpleParser(obj.Body?.toString('utf-8')!);
  const messageId = mail?.messageId as string;

  if (!messageId) {
    throw new ApiError(ApiErrorType.INVALID_REQUEST);
  }

  const from = mail.from?.value || [];
  const to = Array.isArray(mail.to)
    ? mail.to.map((each) => each.value).flat()
    : mail.to?.value || [];
  const cc = Array.isArray(mail.cc)
    ? mail.cc.map((each) => each.value).flat()
    : mail.cc?.value || [];
  const bcc = Array.isArray(mail.bcc)
    ? mail.bcc.map((each) => each.value).flat()
    : mail.bcc?.value || [];

  const fromEmails = from?.map((f) => f.address);
  const toEmails = to?.map((f) => f.address);

  if (fromEmails.length <= 0 || toEmails.length <= 0) {
    throw new ApiError(ApiErrorType.INVALID_REQUEST);
  }

  console.log('attachements', mail.attachments);
  console.log('replyto', mail.inReplyTo);

  // const conversation = await prisma.conversation.findUnique({
  //   where: {
  //     channelExternalId: messageId,
  //   },
  // });

  // const conversationId = conversation?.id || cuid();

  // const attachments = mail.attachments?.map(each => ({

  // }))

  // Retrieve email from S3
  // Parse email with mailparser
  // Check if email exisists in DB
  // Process attachments and save to S3
  // Create message in DB

  const filter = `@${process.env.INBOUND_EMAIL_DOMAIN}`;
  const aliases = toEmails
    .filter((one) => one?.endsWith(filter))
    ?.map((each) => each?.replace(filter, '')) as string[];
  const customDomains = toEmails.filter(
    (one) => !one?.endsWith(filter)
  ) as string[];

  if (aliases?.length <= 0 && customDomains?.length <= 0) {
    // Custom domain not implmented yet
    throw new ApiError(ApiErrorType.INVALID_REQUEST);
  }

  const inboxes = await prisma.mailInbox.findMany({
    where: {
      OR: [
        {
          alias: {
            in: aliases,
          },
        },
        {
          customEmail: {
            in: customDomains,
          },
        },
      ],
    },
    include: {},
  });

  if (inboxes.length <= 0 || inboxes.length > 1) {
    throw new ApiError(ApiErrorType.INVALID_REQUEST);
  }

  const handleUpload = async (
    attachment: mailparser.Attachment,
    fileName?: string
  ) => {
    const params = {
      Bucket: process.env.INBOUND_EMAIL_BUCKET as string,
      Key: `uploads/${fileName || attachment.filename}`,
      Body: attachment.content,
    };

    const upload = await s3.upload(params).promise();

    return upload.Location;
  };

  const attachments = await pMap(
    mail.attachments,
    async (attachment) => {
      const id = cuid();

      const uploadUrl = await handleUpload(
        attachment,
        `${id}.${mime.extension(attachment.contentType)}`
      );

      return {
        id,
        url: uploadUrl,
        size: attachment.size,
        name: attachment.filename,
        mimeType: attachment.contentType,
      } as Partial<Attachment>;
    },
    { concurrency: mail.attachments.length }
  );

  const msg = {
    externalId: notificationId,
    from: MessageFrom.human,
    text: mail.text,
    html: mail.html,
    attachments: {
      createMany: {
        data: attachments,
      },
    },
    metadata: {
      email: {
        date: mail.date,
        from: from as any,
        to: to as any,
        cc: cc as any,
        bcc: bcc as any,
      },
    },
  } as Prisma.MessageCreateInput;

  const contacts = fromEmails.map((email) => ({
    where: {
      unique_email_for_org: {
        email: email!,
        organizationId: inboxes[0].organizationId!,
      },
    },
    create: {
      email,
      organizationId: inboxes[0].organizationId,
    },
  })) as Prisma.ContactCreateOrConnectWithoutConversationsInput[];

  await prisma.conversation.upsert({
    where: {
      channelExternalId: messageId,
    },
    create: {
      title: mail.subject,
      channelExternalId: messageId,
      channel: ConversationChannel.mail,
      mailInboxId: inboxes[0].id,
      organizationId: inboxes[0].organizationId,
      contacts: {
        connectOrCreate: contacts,
      },
      messages: {
        connectOrCreate: [
          {
            where: {
              externalId: notificationId,
            },
            create: msg,
          },
        ],
      },
    },
    update: {
      contacts: {
        connectOrCreate: contacts,
      },
      messages: {
        connectOrCreate: [
          {
            where: {
              externalId: notificationId,
            },
            create: msg,
          },
        ],
      },
    },
  });

  // Remove smpt message from s3
  await clean({
    notificationId,
  });

  console.log('mail', mail);

  return req.body;
}

handler.post(
  validate({
    handler: respond(inboundWebhook),
  })
);

export default handler;
