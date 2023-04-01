import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { PrismaClient } from '@prisma/client';
import NextAuth, { AuthOptions } from 'next-auth';
import EmailProvider from 'next-auth/providers/email';
import GithubProvider from 'next-auth/providers/github';

import prisma from '@app/utils/prisma-client';

const CustomPrismaProvider = (p: PrismaClient) => {
  return {
    ...PrismaAdapter(p),
    async getSessionAndUser(sessionToken: string) {
      const userAndSession = await p.session.findUnique({
        where: { sessionToken },
        include: {
          user: {
            include: {
              subscriptions: {
                where: {
                  status: 'active',
                },
              },
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
  ],
  callbacks: {
    async session({ session, user, token }) {
      return {
        ...session,
        user: {
          ...session.user,
          id: user.id,
          isPremium: (user as any)?.subscriptions?.length > 0,
          customerId: (user as any)?.subscriptions?.[0]?.customerId as string,
        },
      };
    },
  },
} as AuthOptions;
export default NextAuth(authOptions);
