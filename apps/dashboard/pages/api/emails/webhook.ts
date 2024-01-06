import { NextApiResponse } from 'next';

import { ApiError, ApiErrorType } from '@chaindesk/lib/api-error';
import { s3 } from '@chaindesk/lib/aws';
import { createApiHandler, respond } from '@chaindesk/lib/createa-api-handler';
import mailparser from '@chaindesk/lib/mail-parser';
import { AppNextApiRequest } from '@chaindesk/lib/types/index';
import validate from '@chaindesk/lib/validate';
import { ConversationChannel } from '@chaindesk/prisma';
import { prisma } from '@chaindesk/prisma/client';

const handler = createApiHandler();

export async function inboundWebhook(
  req: AppNextApiRequest,
  res: NextApiResponse
) {
  console.log('REQ.BODY =--================>', req.body);

  const notification = req.body?.Records?.[0]?.ses;
  const messageId = notification?.mail?.messageId as string;

  if (!messageId) {
    throw new ApiError(ApiErrorType.INVALID_REQUEST);
  }

  const obj = await s3
    .getObject({
      Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME as string,
      Key: `emails/${messageId}`,
    })
    .promise();

  const mail = await mailparser.simpleParser(obj.Body?.toString('utf-8')!);

  if (!mail) {
    throw new ApiError(ApiErrorType.INVALID_REQUEST);
  }

  // console.log('mail', mail);
  console.log('mail.from', mail.from);

  const from = mail.from?.value || [];
  const to = (mail.to as mailparser.AddressObject)?.value || [];

  const fromEmails = from?.map((f) => f.address);
  const toEmails = to?.map((f) => f.address);

  if (fromEmails.length <= 0 || toEmails.length <= 0) {
    throw new ApiError(ApiErrorType.INVALID_REQUEST);
  }

  // const attachments = mail.attachments?.map(each => ({

  // }))

  console.log('attachements', mail.attachments);

  // Retrieve email from S3
  // Parse email with mailparser
  // Check if email exisists in DB
  // Process attachments and save to S3
  // Create message in DB

  return req.body;
}

handler.post(
  validate({
    handler: respond(inboundWebhook),
  })
);

export default handler;
