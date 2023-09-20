import { Message } from '@prisma/client';
import JSZip from 'jszip';
import { NextApiResponse } from 'next';
import { z } from 'zod';

import { ConversationWithMessages } from '@app/types/dtos';
import { AppNextApiRequest } from '@app/types/index';
import { createAuthApiHandler, respond } from '@app/utils/createa-api-handler';
import { generateExcelBuffer } from '@app/utils/export/excel-export';
import prisma from '@app/utils/prisma-client';
import validate from '@app/utils/validate';

const handler = createAuthApiHandler();

async function exportConversations(
  req: AppNextApiRequest,
  res: NextApiResponse
) {
  const session = req.session;

  const { conversations } = await prisma.organization.findUniqueOrThrow({
    where: {
      id: session?.organization?.id,
    },
    include: {
      conversations: {
        include: {
          messages: true,
        },
      },
    },
  });

  const zipBuffer = await zipConversations(conversations);

  res.setHeader('Content-Type', 'application/zip');
  res.setHeader('Content-Disposition', 'attachment; filename=data.zip');
  res.send(zipBuffer);
}

handler.post(
  validate({
    body: z.object({ userId: z.string().cuid() }),
    handler: respond(exportConversations),
  })
);

async function zipConversations(conversations: ConversationWithMessages[]) {
  const zip = new JSZip();

  const header = [
    'conversation_id',
    'message_id',
    'text',
    'from',
    'sources',
    'evaluation',
    'read',
    'createdAt',
  ];

  const zipConversation = async (conversation: ConversationWithMessages) => {
    let rows = [];
    for (const message of conversation.messages) {
      const messageDetails = [
        message.conversationId,
        message.id,
        message.text,
        message.from,
        JSON.stringify(message.sources),
        message.eval,
        message.read,
        message.createdAt,
      ];
      rows.push(messageDetails);
    }
    const excelBuffer = await generateExcelBuffer<Message>({ header, rows });
    zip.file(`${conversation.id}.csv`, excelBuffer);
  };

  const zipPromises = conversations.map((conversation) =>
    zipConversation(conversation)
  );
  await Promise.all(zipPromises);

  return zip.generateAsync({ type: 'nodebuffer' });
}

export default handler;
