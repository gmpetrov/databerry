import {
  MembershipRole,
  Prisma,
  SubscriptionPlan,
  Usage,
  User,
} from '@prisma/client';
import { NextApiResponse } from 'next';
import { Session } from 'next-auth';
import { getServerSession } from 'next-auth/next';
import { Middleware } from 'next-connect';
import { v4 as uuidv4 } from 'uuid';

import { authOptions } from '@app/pages/api/auth/[...nextauth]';
import { AppNextApiRequest } from '@app/types/index';
import prisma from '@app/utils/prisma-client';

import logger from './logger';

export const sessionUserInclude: Prisma.UserInclude = {
  usage: true,
  subscriptions: {
    where: {
      status: 'active',
    },
  },
  memberships: {
    include: {
      organization: {
        include: {
          usage: true,
        },
      },
    },
  },
  _count: {
    select: {
      agents: true,
      datastores: true,
    },
  },
};

export const sessionOrganizationInclude: Prisma.OrganizationInclude = {
  usage: true,
  subscriptions: {
    where: {
      status: 'active',
    },
  },
  _count: {
    select: {
      agents: true,
      datastores: true,
    },
  },
};

export const formatUserSession = (
  user: Prisma.UserGetPayload<{ include: typeof sessionUserInclude }>
) => {
  return {
    ...user,
    memberships: user?.memberships || [],
    usage: user?.usage as Usage,
    nbAgents: user?.['_count']?.agents as number,
    nbDatastores: user?.['_count']?.datastores as number,
    id: user.id,
    currentPlan:
      user?.subscriptions?.[0]?.plan ||
      (SubscriptionPlan.level_0 as SubscriptionPlan),
    isPremium: Number(user?.subscriptions?.length) > 0,
    customerId: user?.subscriptions?.[0]?.customerId as string,
  };
};

export const formatOrganizationSession = (
  organization: Prisma.OrganizationGetPayload<{
    include: typeof sessionOrganizationInclude;
  }>
) => {
  return {
    ...organization,
    usage: organization?.usage as Usage,
    nbAgents: organization?.['_count']?.agents as number,
    nbDatastores: organization?.['_count']?.datastores as number,
    currentPlan:
      organization?.subscriptions?.[0]?.plan ||
      (SubscriptionPlan.level_0 as SubscriptionPlan),
    isPremium: Number(organization?.subscriptions?.length) > 0,
    customerId: organization?.subscriptions?.[0]?.customerId as string,
  };
};

const handleGetSession = async (
  req: AppNextApiRequest,
  res: NextApiResponse
) => {
  const authHeader = req.headers.authorization;
  const apiKey = authHeader && authHeader.split(' ')?.[1];
  let session: Session | null = null;

  if (apiKey) {
    const key = await prisma.userApiKey.findUnique({
      where: {
        key: apiKey,
      },
      include: {
        user: {
          include: sessionUserInclude,
        },
        organization: {
          include: sessionOrganizationInclude,
        },
      },
    });

    if (key?.organization) {
      session = {
        user: undefined,
        roles: [MembershipRole.ADMIN],
        organization: formatOrganizationSession(key.organization!),
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toDateString(),
      };
    }
  } else {
    session = await getServerSession(req, res, authOptions);
  }

  return session;
};

const auth: Middleware<AppNextApiRequest, NextApiResponse> = async (
  req,
  res,
  next
) => {
  const session = await handleGetSession(req, res);

  if (!session) {
    return res.status(403).end('Forbidden');
  }

  req.session = session;

  return next();
};
export const optionalAuth: Middleware<
  AppNextApiRequest,
  NextApiResponse
> = async (req, res, next) => {
  const session = await handleGetSession(req, res);

  if (session) {
    req.session = session;
  }

  return next();
};

export const withLogger: Middleware<
  AppNextApiRequest,
  NextApiResponse
> = async (req, res, next) => {
  if (!req.requestId) {
    req.requestId = uuidv4();
  }

  req.logger = logger.child({
    requestId: req.requestId,
    requestPath: req.url,
  });

  req.logger.info(req.method);

  // res.on('close', () => {
  //   req.logger.info('end');
  // });

  return next();
};

export default auth;
