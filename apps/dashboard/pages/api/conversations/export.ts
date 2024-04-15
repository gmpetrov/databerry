import JSZip from 'jszip';
import { NextApiResponse } from 'next';
import { z } from 'zod';

import {
  createAuthApiHandler,
  respond,
} from '@chaindesk/lib/createa-api-handler';
import { generateExcelBuffer } from '@chaindesk/lib/export/excel-export';
import { ConversationWithMessages } from '@chaindesk/lib/types/dtos';
import { AppNextApiRequest } from '@chaindesk/lib/types/index';
import validate from '@chaindesk/lib/validate';
import {
  ConversationChannel,
  ConversationPriority,
  Message,
  MessageEval,
} from '@chaindesk/prisma';
import { prisma } from '@chaindesk/prisma/client';
const handler = createAuthApiHandler();

const bodySchema = z.object({
  channel: z.nativeEnum(ConversationChannel).optional(),
  priority: z.nativeEnum(ConversationPriority).optional(),
  messageEval: z.nativeEnum(MessageEval).optional(),
  agentId: z.string().optional(),
  assigneeId: z.string().optional(),
});

async function exportConversations(
  req: AppNextApiRequest,
  res: NextApiResponse
) {
  const session = req.session;

  const { channel, priority, agentId, assigneeId, messageEval } =
    bodySchema.parse(req.body);

  const conversations = await prisma.conversation.findMany({
    where: {
      organizationId: session?.organization?.id,
      ...(channel ? { channel } : {}),
      ...(priority ? { priority } : {}),
      ...(agentId ? { agentId } : {}),
      ...(assigneeId ? { assignees: { some: { id: assigneeId } } } : {}),
      ...(messageEval ? { messages: { every: { eval: messageEval } } } : {}),
    },
    include: {
      messages: true,
      agent: true,
    },
  });

  const zipBuffer = await zipConversations(conversations);

  res.setHeader('Content-Type', 'application/zip');
  res.setHeader('Content-Disposition', 'attachment; filename=data.zip');
  res.send(zipBuffer);
}

handler.post(
  validate({
    handler: respond(exportConversations),
  })
);

async function zipConversations(conversations: ConversationWithMessages[]) {
  const zip = new JSZip();

  const header = [
    'agent_id',
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
        conversation?.agentId,
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
