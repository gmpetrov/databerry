import { MessageEval } from '@prisma/client';
import dayjs from 'dayjs';
import { NextApiResponse } from 'next';
import { z, ZodError } from 'zod';

import {
  createAuthApiHandler,
  respond,
} from '@chaindesk/lib/createa-api-handler';
import { AppNextApiRequest } from '@chaindesk/lib/types';
import prisma from '@chaindesk/prisma/client';
const handler = createAuthApiHandler();
const querySchema = z.object({
  view: z.union([z.literal('month'), z.literal('year')]),
});

export const getAnalytics = async (
  req: AppNextApiRequest,
  res: NextApiResponse
) => {
  try {
    const { view } = querySchema.parse(req.query);
    const { organization } = req.session;

    let results = [] as any;
    if (view === 'month') {
      const startOfMonth = dayjs(new Date()).startOf('month').toISOString();
      const endOfMonth = dayjs(new Date()).endOf('month').toISOString();
      const monthRange = {
        gte: startOfMonth,
        lte: endOfMonth,
      };

      // batch read queries
      results = await prisma.$transaction([
        prisma.conversation.count({
          where: {
            createdAt: monthRange,
          },
        }),

        prisma.message.count({
          where: {
            createdAt: monthRange,
            eval: MessageEval.bad,
          },
        }),

        prisma.message.count({
          where: {
            createdAt: monthRange,
            eval: MessageEval.good,
          },
        }),

        prisma.lead.count({
          where: {
            createdAt: monthRange,
            organizationId: organization.id,
          },
        }),

        prisma.appDatasource.groupBy({
          by: ['type'],
          where: { organizationId: organization.id },
          _count: {
            type: true,
          },
          orderBy: {
            _count: {
              type: 'desc',
            },
          },
          take: 1,
        }),

        prisma.$queryRaw`
          SELECT
          EXTRACT(YEAR FROM m.created_at) as year,
          EXTRACT(DAY FROM m.created_at) as day,
          CAST(SUM(CASE WHEN eval = 'good' THEN 1 ELSE 0 END) AS INTEGER) as "good_count",
          CAST(SUM(CASE WHEN eval = 'bad' THEN 1 ELSE 0 END) AS INTEGER) as "bad_count"
          FROM messages m
          JOIN conversations c ON m.conversation_id = c.id
          WHERE
          m.created_at BETWEEN ${startOfMonth}::timestamp AND ${endOfMonth}::timestamp
          AND
          c.organization_id = ${organization.id}
          GROUP BY year, day
          ORDER BY year, day`,

        prisma.$queryRaw`
          SELECT
          EXTRACT(YEAR FROM created_at) as year,
          EXTRACT(DAY FROM created_at) as day,
          CAST(COUNT(*) AS INTEGER) as "conversation_count"
          FROM Conversations
          WHERE
          created_at BETWEEN  ${startOfMonth}::timestamp AND ${endOfMonth}::timestamp
          AND
          organization_id = ${organization.id}
          GROUP BY year, day
          ORDER BY year, day`,
      ]);
    } else if ('year') {
      const startOfYear = dayjs(new Date()).startOf('year').toISOString();
      const endOfYear = dayjs(new Date()).endOf('year').toISOString();
      const yearRange = {
        gte: startOfYear,
        lte: endOfYear,
      };

      // batch read queries
      results = await prisma.$transaction([
        prisma.conversation.count({
          where: {
            createdAt: yearRange,
          },
        }),

        prisma.message.count({
          where: {
            createdAt: yearRange,
            eval: MessageEval.bad,
          },
        }),

        prisma.message.count({
          where: {
            createdAt: yearRange,
            eval: MessageEval.good,
          },
        }),

        prisma.lead.count({
          where: {
            createdAt: yearRange,
            organizationId: organization.id,
          },
        }),
        prisma.appDatasource.groupBy({
          by: ['type'],
          where: { organizationId: organization.id },
          _count: {
            type: true,
          },
          orderBy: {
            _count: {
              type: 'desc',
            },
          },
          take: 1,
        }),

        prisma.$queryRaw`
          SELECT
          EXTRACT(YEAR FROM m.created_at) as year,
          EXTRACT(MONTH FROM m.created_at) as month,
          CAST(SUM(CASE WHEN eval = 'good' THEN 1 ELSE 0 END) AS INTEGER) as "good_count",
          CAST(SUM(CASE WHEN eval = 'bad' THEN 1 ELSE 0 END) AS INTEGER) as "bad_count"
          FROM messages as m
          JOIN conversations c ON m.conversation_id = c.id
          WHERE
          m.created_at BETWEEN ${startOfYear}::timestamp AND ${endOfYear}::timestamp
          AND
          c.organization_id = ${organization.id}
          GROUP BY year, month
          ORDER BY year, month`,

        prisma.$queryRaw`
          SELECT
          EXTRACT(YEAR FROM created_at) as year,
          EXTRACT(MONTH FROM created_at) as month,
          CAST(COUNT(*) AS INTEGER) as "conversation_count"
          FROM Conversations
          WHERE
          created_at BETWEEN  ${startOfYear}::timestamp AND ${endOfYear}::timestamp
          AND
          organization_id = ${organization.id}
          GROUP BY year, month
          ORDER BY year, month`,
      ]);
    }
    const [
      conversationCount,
      dislikedRepliesCount,
      likedRepliesCount,
      leadCount,
      datasources,
      repliesMetrics,
      conversationMetrics,
    ] = results;

    const mostUsedDatasource =
      (datasources || []).length > 0
        ? {
            name: (datasources as any)[0]?.type,
            count: (datasources as any)[0]?._count?.type,
          }
        : undefined;

    return {
      conversationCount,
      dislikedRepliesCount,
      likedRepliesCount,
      leadCount,
      mostUsedDatasource,
      repliesMetrics,
      conversationMetrics,
    };
  } catch (e) {
    if (e instanceof ZodError) {
      throw { status: 400, message: e.formErrors.fieldErrors };
    }
    throw e;
  }
};

handler.get(respond(getAnalytics));
export default handler;
