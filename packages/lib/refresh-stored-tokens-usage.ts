import { prisma } from '@chaindesk/prisma/client';

const refreshStoredTokensUsage = async (orgId: string) => {
  return prisma.$transaction(async (tx) => {
    const res = await tx.appDatasource.aggregate({
      where: {
        organizationId: orgId,
      },
      _sum: {
        nbTokens: true,
      },
    });

    return tx.usage.update({
      where: {
        organizationId: orgId,
      },
      data: {
        nbStoredTokens: res._sum?.nbTokens || 0,
      },
    });
  });
};

export default refreshStoredTokensUsage;
