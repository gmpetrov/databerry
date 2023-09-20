import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { Prisma, PrismaClient, SubscriptionPlan, Usage } from '@prisma/client';
import NextAuth, { AuthOptions, getServerSession } from 'next-auth';
import { AdapterUser } from 'next-auth/adapters';
import EmailProvider from 'next-auth/providers/email';
import GithubProvider from 'next-auth/providers/github';
import GoogleProvider from 'next-auth/providers/google';

import {
  sessionOrganizationInclude,
  sessionUserInclude,
} from '@app/utils/auth';
import { formatOrganizationSession, formatUserSession } from '@app/utils/auth';
import generateFunId from '@app/utils/generate-fun-id';
import prisma from '@app/utils/prisma-client';
import uuidv4 from '@app/utils/uuid';

const CustomPrismaProvider = (p: PrismaClient) => {
  return {
    ...PrismaAdapter(p),
    createSession: async (data: Prisma.SessionCreateArgs['data']) => {
      const membership = await p.membership.findFirst({
        where: {
          userId: data.userId,
        },
      });

      return p.session.create({
        data: {
          ...data,
          organizationId: membership?.organizationId as string,
        } as Prisma.SessionCreateArgs['data'],
      });
    },
    createUser: (data: Prisma.UserCreateArgs['data']) =>
      p.user.create({
        data: {
          ...data,
          memberships: {
            create: {
              role: 'OWNER',
              organization: {
                create: {
                  name: generateFunId(),
                  apiKeys: {
                    create: {
                      key: uuidv4(),
                    },
                  },
                  usage: {
                    create: {},
                  },
                },
              },
            },
          },
          // TODO: REMOVE AFTER MIGRATIOM
          // usage: {
          //   create: {},
          // },
          // apiKeys: {
          //   create: {
          //     key: uuidv4(),
          //   },
          // },
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
          organization: {
            include: {
              ...sessionOrganizationInclude,
            },
          },
        },
      });
      if (!userAndSession) return null;
      const { user, ...session } = userAndSession;
      return {
        user: {
          ...user,
          sessionId: session.id,
          organization: session.organization,
        },
        session,
      };
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
    async session(props) {
      const { session, trigger, newSession, token } = props;
      const user = props.user as AdapterUser &
        Prisma.UserGetPayload<{ include: typeof sessionUserInclude }> & {
          sessionId: string;
          organization: Prisma.OrganizationGetPayload<{
            include: typeof sessionOrganizationInclude;
          }>;
        };

      let organization = user?.organization;

      const found = user?.memberships?.find(
        (one) => one.organizationId === organization.id
      );

      const handleUpdateOrg = (orgId: string) => {
        return prisma.session.update({
          where: {
            id: user?.sessionId,
          },
          data: {
            organization: {
              connect: {
                id: orgId,
              },
            },
          },
          include: {
            organization: {
              include: {
                ...sessionOrganizationInclude,
              },
            },
          },
        });
      };

      if (!found) {
        // User has no access to this organization anymore, update the session
        const defaultOrgId = user?.memberships?.[0]?.organizationId;

        const updated = await handleUpdateOrg(defaultOrgId!);

        organization = updated.organization!;
      } else if (trigger === 'update' && newSession.orgId) {
        const found = user?.memberships?.find(
          (one) => one.organizationId === newSession.orgId
        );

        if (!found) {
          throw new Error('Unauthorized');
        }

        const updated = await handleUpdateOrg(newSession.orgId!);

        organization = updated.organization!;
      }

      const roles = [
        user?.memberships?.find(
          (one) => one.organizationId === organization?.id
        )?.role,
        user?.role,
      ];

      return {
        authType: 'session',
        ...session,
        roles,
        organization: {
          ...organization,
          ...formatOrganizationSession(organization),
        },
        user: {
          ...session.user,

          ...formatUserSession(user),
        },
      };
    },
  },
} as AuthOptions;
export default NextAuth(authOptions);
