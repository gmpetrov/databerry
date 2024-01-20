import { JobStatus } from '@prisma/client';
import { NextApiResponse } from 'next';

import { ApiError, ApiErrorType } from '@chaindesk/lib/api-error';
import {
  createAuthApiHandler,
  respond,
} from '@chaindesk/lib/createa-api-handler';
import { AppNextApiRequest } from '@chaindesk/lib/types';
import { updateWorkflowSchema } from '@chaindesk/lib/types/dtos';
import validate from '@chaindesk/lib/validate';
import { prisma } from '@chaindesk/prisma/client';

const handler = createAuthApiHandler();

export const getWorkflow = async (
  req: AppNextApiRequest,
  res: NextApiResponse
) => {
  const session = req.session;
  const id = req.query.id as string;
  const offset = parseInt((req.query.offset as string) || '0');
  const limit = parseInt((req.query.limit as string) || '100');
  const status = req.query.status as JobStatus | undefined;

  const workflow = await prisma.workflow.findUnique({
    where: {
      id,
    },
    include: {
      agent: {
        select: {
          organizationId: true,
          name: true,
        },
      },
      _count: {
        select: {
          jobs: true,
        },
      },
      jobs: {
        where: {
          ...(status ? { status } : {}),
        },
        skip: offset * limit,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  });

  if (workflow?.agent?.organizationId !== session.organization.id) {
    throw new ApiError(ApiErrorType.UNAUTHORIZED);
  }

  return workflow;
};

handler.get(respond(getWorkflow));

export const updateWorkflow = async (
  req: AppNextApiRequest,
  res: NextApiResponse
) => {
  const session = req.session;
  const id = req.query.id as string;
  const updates = updateWorkflowSchema.parse(req.body);

  const workflow = await prisma.workflow.findUnique({
    where: {
      id,
    },
    include: {
      agent: {
        select: {
          organizationId: true,
        },
      },
    },
  });

  if (!workflow) {
    throw new ApiError(ApiErrorType.NOT_FOUND);
  }

  if (workflow?.agent.organizationId !== session.organization.id) {
    throw new ApiError(ApiErrorType.UNAUTHORIZED);
  }

  const updated = await prisma.workflow.update({
    where: {
      id,
    },
    data: {
      ...updates,
      recurrence: updates.recurrence?.type,
      recurrenceConfig: updates.recurrence?.config,
    },
  });

  return updated;
};

handler.patch(
  validate({
    body: updateWorkflowSchema,
    handler: respond(updateWorkflow),
  })
);

export const deleteWorkflow = async (
  req: AppNextApiRequest,
  res: NextApiResponse
) => {
  const session = req.session;
  const id = req.query.id as string;

  const workflow = await prisma.workflow.findUnique({
    where: {
      id,
    },
    include: {
      agent: {
        select: {
          organizationId: true,
        },
      },
    },
  });

  if (!workflow) {
    throw new ApiError(ApiErrorType.NOT_FOUND);
  }

  if (workflow?.agent.organizationId !== session.organization.id) {
    throw new ApiError(ApiErrorType.UNAUTHORIZED);
  }

  const deleted = await prisma.workflow.delete({
    where: {
      id,
    },
  });

  return deleted;
};

handler.delete(respond(deleteWorkflow));

export default handler;
