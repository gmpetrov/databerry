import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { PrismaClient, SubscriptionPlan, Usage } from '@prisma/client';
import NextAuth, { AuthOptions } from 'next-auth';
import EmailProvider from 'next-auth/providers/email';
import GithubProvider from 'next-auth/providers/github';
import GoogleProvider from 'next-auth/providers/google';

import { sessionUserInclude } from '@app/utils/auth';
import prisma from '@app/utils/prisma-client';
import uuidv4 from '@app/utils/uuid';

const CustomPrismaProvider = (p: PrismaClient) => {
  return {
    ...PrismaAdapter(p),
    createUser: (data: any) =>
      p.user.create({
        data: {
          ...data,
          usage: {
            create: {},
          },
          apiKeys: {
            create: {
              key: uuidv4(),
            },
          },
        },
      }),
    async getSessionAndUser(sessionToken: string) {
      const userAndSession = await p.session.findUnique({
        where: { sessionToken },
        include: {
          user: {
            include: {
              ...sessionUserInclude,
            },
          },
        },
      });
      if (!userAndSession) return null;
      const { user, ...session } = userAndSession;
      return { user, session };
    },
  };
};

export const authOptions = {
  adapter: CustomPrismaProvider(prisma),
  providers: [
    EmailProvider({
      server: process.env.EMAIL_SERVER,
      from: process.env.EMAIL_FROM,
    }),
    GithubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
        },
      },
    }),
  ],
  callbacks: {
    async session({ session, user, token }) {
      return {
        ...session,
        user: {
          ...session.user,
          usage: (user as any)?.usage as Usage,
          nbAgents: (user as any)?.['_count']?.agents as number,
          nbDatastores: (user as any)?.['_count']?.datastores as number,
          id: user.id,
          currentPlan:
            (user as any)?.subscriptions?.[0]?.plan ||
            (SubscriptionPlan.level_0 as SubscriptionPlan),
          isPremium: (user as any)?.subscriptions?.length > 0,
          customerId: (user as any)?.subscriptions?.[0]?.customerId as string,
        },
      };
    },
  },
} as AuthOptions;
export default NextAuth(authOptions);
