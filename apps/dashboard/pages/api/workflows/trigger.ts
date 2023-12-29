import { ConversationChannel, JobStatus, MessageFrom } from '@prisma/client';
import cuid from 'cuid';
import { NextApiResponse } from 'next';
import { z } from 'zod';

import AgentManager from '@chaindesk/lib/agent';
import { ApiError, ApiErrorType } from '@chaindesk/lib/api-error';
import ConversationManager from '@chaindesk/lib/conversation';
import {
  createAuthApiHandler,
  respond,
} from '@chaindesk/lib/createa-api-handler';
import { AppNextApiRequest } from '@chaindesk/lib/types';
import validate from '@chaindesk/lib/validate';
import { prisma } from '@chaindesk/prisma/client';

const handler = createAuthApiHandler();

const triggerSchema = z.object({
  workflowId: z.string().min(8),
});

export const triggerWorkflow = async (
  req: AppNextApiRequest,
  res: NextApiResponse
) => {
  const session = req.session;
  const { workflowId } = triggerSchema.parse(req.body);

  const workflow = await prisma.workflow.findUniqueOrThrow({
    where: {
      id: workflowId,
    },
    include: {
      agent: {
        include: {
          tools: {
            include: {
              datastore: true,
              form: true,
            },
          },
        },
      },
    },
  });

  if (workflow?.agent.organizationId !== session.organization.id) {
    throw new ApiError(ApiErrorType.UNAUTHORIZED);
  }

  const manager = new AgentManager({ agent: workflow?.agent });

  const job = await prisma.job.create({
    data: {
      workflowId,
    },
  });

  await prisma.job.update({
    where: {
      id: job.id,
    },
    data: {
      status: JobStatus.RUNNING,
    },
  });

  const conversationId = cuid();
  const conversationManager = new ConversationManager({
    conversationId,
    organizationId: workflow?.agent.organizationId,
    channel: ConversationChannel.automation,
    agentId: workflow.agentId!,
  });

  conversationManager.push({
    from: MessageFrom.human,
    text: workflow.query,
  });

  const answer = await manager.query({ input: workflow.query });

  conversationManager.push({
    from: MessageFrom.agent,
    text: answer.answer,
  });

  await conversationManager.save();

  await prisma.job.update({
    where: {
      id: job.id,
    },
    data: {
      conversationId,
      status: JobStatus.DONE,
    },
  });

  return job;
};

handler.post(
  validate({
    body: triggerSchema,
    handler: respond(triggerWorkflow),
  })
);

export default handler;
