import { NextApiResponse } from 'next';

import { ApiError, ApiErrorType } from '@chaindesk/lib/api-error';
import {
  createAuthApiHandler,
  respond,
} from '@chaindesk/lib/createa-api-handler';
import { AppNextApiRequest } from '@chaindesk/lib/types';
import { createWorkflowSchema } from '@chaindesk/lib/types/dtos';
import validate from '@chaindesk/lib/validate';
import { prisma } from '@chaindesk/prisma/client';

const handler = createAuthApiHandler();

export const createWorkflow = async (
  req: AppNextApiRequest,
  res: NextApiResponse
) => {
  const session = req.session;
  const { agentId, query, name, description, recurrence } =
    createWorkflowSchema.parse(req.body);

  const agent = await prisma.agent.findUnique({
    where: {
      id: agentId,
    },
  });

  if (agent?.organizationId !== session.organization.id) {
    throw new ApiError(ApiErrorType.UNAUTHORIZED);
  }

  return prisma.workflow.create({
    data: {
      name,
      description,
      agentId,
      query,
      recurrence: recurrence.type,
      recurrenceConfig: recurrence.config,
    },
  });
};

handler.post(
  validate({
    body: createWorkflowSchema,
    handler: respond(createWorkflow),
  })
);
export default handler;
