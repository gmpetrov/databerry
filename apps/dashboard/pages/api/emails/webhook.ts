import { S3 } from 'aws-sdk';
import cuid from 'cuid';
import EmailReplyParser from 'email-reply-parser';
import mime from 'mime-types';
import { NextApiResponse } from 'next';
import pMap from 'p-map';

import { ApiError, ApiErrorType } from '@chaindesk/lib/api-error';
import { s3 } from '@chaindesk/lib/aws';
import { createApiHandler, respond } from '@chaindesk/lib/createa-api-handler';
import { creatChatUploadKey } from '@chaindesk/lib/file-upload';
import getS3RootDomain from '@chaindesk/lib/get-s3-root-domain';
import mailparser from '@chaindesk/lib/mail-parser';
import { AppNextApiRequest } from '@chaindesk/lib/types/index';
import validate from '@chaindesk/lib/validate';
import {
  Attachment,
  ConversationChannel,
  MailInbox,
  MessageFrom,
  Prisma,
} from '@chaindesk/prisma';
import { prisma } from '@chaindesk/prisma/client';

export const mailS3 = new S3({
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
  return mailS3
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

  const obj = await mailS3
    .getObject({
      Bucket: process.env.INBOUND_EMAIL_BUCKET as string,
      Key: `emails/${notificationId}`,
    })
    .promise();

  const mail = await mailparser.simpleParser(obj.Body?.toString('utf-8')!);
  console.log('Parsed headers----------_>', JSON.stringify(mail.headers));
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
  console.log('replyto ----------->', mail.inReplyTo);

  let forwardTo = mail.headers.get('x-forwarded-to');
  console.log('forwardTo---------->', forwardTo);
  forwardTo = ((!!forwardTo && typeof forwardTo === 'string'
    ? [forwardTo]
    : forwardTo) || []) as string[];

  console.log('forwardTo----------->', forwardTo);

  const filter = `@${process.env.INBOUND_EMAIL_DOMAIN}`;
  const aliases = [
    ...toEmails.filter((one) => one?.endsWith(filter)),
    ...forwardTo?.filter?.((each: string) => each?.endsWith?.(filter)),
  ]?.map((each) => each?.replace(filter, '')) as string[];

  const customDomains = toEmails.filter(
    (one) => !one?.endsWith(filter)
  ) as string[];

  console.log('aliases------->', aliases);
  console.log('customDomains---------->', customDomains);

  if (aliases?.length <= 0 && customDomains?.length <= 0) {
    // Custom domain not implmented yet
    throw new ApiError(ApiErrorType.INVALID_REQUEST);
  }

  const organizations = await prisma.organization.findMany({
    where: {
      OR: [
        {
          id: {
            in: aliases,
          },
        },
        {
          mailInboxes: {
            some: {
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
          },
        },
      ],
    },
    include: {
      mailInboxes: {
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
      },
    },
  });

  const inboxes = organizations
    .map((organization) => {
      if (organization.mailInboxes?.length <= 0) {
        return {
          showBranding: true,
          alias: organization.id!,
          fromName: organization.name!,
          organizationId: organization.id!,
          name: organization.name!,
          description: organization.name!,
        } as MailInbox;
      }
      return organization.mailInboxes;
    })
    .flat();

  if (inboxes.length <= 0) {
    console.log('No inbox found---------->');
    throw new ApiError(ApiErrorType.INVALID_REQUEST);
  }

  await pMap(inboxes, async (inbox) => {
    let references: string[] = [messageId];

    if (mail.references) {
      references = [
        ...references,
        ...(Array.isArray(mail.references)
          ? mail.references
          : [mail.references]),
      ];
    }

    if (mail.inReplyTo) {
      references = [...references, mail.inReplyTo];
    }

    let prevConversation = null;

    if (references.length > 0) {
      prevConversation = await prisma.conversation.findFirst({
        where: {
          channelExternalId: {
            in: references,
          },
        },
      });
    }
    const conversationId = prevConversation?.id || cuid();

    const handleUpload = async (
      attachment: mailparser.Attachment,
      fileName?: string
    ) => {
      const key = creatChatUploadKey({
        conversationId,
        organizationId: inbox.organizationId!,
        fileName: (fileName || attachment.filename)!,
      });

      const params = {
        Bucket: process.env.INBOUND_EMAIL_BUCKET as string,
        ContentType: attachment.contentType,
        Key: key,
        Body: attachment.content,
      } as S3.Types.PutObjectRequest;

      const upload = await s3.upload(params).promise();

      // return upload.Location;
      return `${getS3RootDomain()}/${key}`;
    };

    const attachments =
      mail.attachments.length > 0
        ? await pMap(
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
          )
        : [];

    let lastMessage = '';
    try {
      lastMessage = new EmailReplyParser().read(mail.text!).getVisibleText();
    } catch (err) {
      console.log(err, err);
    }

    console.log('current message', mail.text);
    console.log('parsed message', lastMessage);

    // Get From Contact
    const fromContact = fromEmails[0];
    const contact = await prisma.contact.upsert({
      where: {
        unique_email_for_org: {
          email: fromContact!,
          organizationId: inbox.organizationId!,
        },
      },
      create: {
        email: fromContact!,
        organizationId: inbox.organizationId!,
      },
      update: {},
    });

    const msg = {
      externalId: messageId,
      contactId: contact.id,
      from: MessageFrom.human,
      text: lastMessage || mail.text,
      html: mail.html || '',
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

    // Only handle a single from email for now
    const connectOrCreateContacts = [fromEmails[0]].map((email) => ({
      where: {
        unique_email_for_org: {
          email: email!,
          organizationId: inbox.organizationId!,
        },
      },
      create: {
        email,
        organizationId: inbox.organizationId,
      },
    })) as Prisma.ContactCreateOrConnectWithoutConversationsInput[];

    await prisma.conversation.upsert({
      where: {
        id: conversationId,
      },
      create: {
        id: conversationId,
        isAiEnabled: false,
        channelExternalId: messageId,
        title: mail.subject,
        channel: ConversationChannel.mail,
        mailInboxId: inbox.id,
        organizationId: inbox.organizationId,
        participantsContacts: {
          connectOrCreate: connectOrCreateContacts,
        },
        messages: {
          connectOrCreate: [
            {
              where: {
                externalId: messageId,
              },
              create: msg,
            },
          ],
        },
      },
      update: {
        isAiEnabled: false,
        status: 'UNRESOLVED',
        participantsContacts: {
          connectOrCreate: connectOrCreateContacts,
        },
        messages: {
          connectOrCreate: [
            {
              where: {
                externalId: messageId,
              },
              create: msg,
            },
          ],
        },
      },
    });
  });

  // Remove smpt message from mailS3
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
