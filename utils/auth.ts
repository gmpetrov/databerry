import { Prisma, SubscriptionPlan, Usage, User } from '@prisma/client';
import { NextApiResponse } from 'next';
import { Session } from 'next-auth';
import { getServerSession } from 'next-auth/next';
import { Middleware } from 'next-connect';

import { authOptions } from '@app/pages/api/auth/[...nextauth]';
import { AppNextApiRequest } from '@app/types/index';
import prisma from '@app/utils/prisma-client';

export const sessionUserInclude: Prisma.UserInclude = {
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

export const formatUserSession = (user: User) => {
  return {
    ...user,
    usage: (user as any)?.usage as Usage,
    nbAgents: (user as any)?.['_count']?.agents as number,
    nbDatastores: (user as any)?.['_count']?.datastores as number,
    id: user.id,
    currentPlan:
      (user as any)?.subscriptions?.[0]?.plan ||
      (SubscriptionPlan.level_0 as SubscriptionPlan),
    isPremium: (user as any)?.subscriptions?.length > 0,
    customerId: (user as any)?.subscriptions?.[0]?.customerId as string,
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
      },
    });

    if (key?.user) {
      session = {
        user: {
          ...formatUserSession(key.user),
        },
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

export default auth;
