import { MessageEval, PrismaPromise } from '@prisma/client';
import dayjs from 'dayjs';
import { NextApiResponse } from 'next';
import { z, ZodError } from 'zod';

import RedisClient from '@chaindesk/lib/cache/redis';
import {
  createAuthApiHandler,
  respond,
} from '@chaindesk/lib/createa-api-handler';
import { AppNextApiRequest } from '@chaindesk/lib/types';
import prisma from '@chaindesk/prisma/client';
const handler = createAuthApiHandler();

enum RANGE {
  MONTH = 'month',
  YEAR = 'year',
}

const querySchema = z.object({
  view: z.union([z.literal('month'), z.literal('year')]),
});

interface DbGetterArgs {
  organizationId: string;
  range: 'month' | 'year';
}

// returns total conversations,liked replies, disliked replies, leads generated, most used datasource
function getKeyMetrics({ organizationId, range }: DbGetterArgs) {
  let start_date;
  let end_date;
  switch (range) {
    case RANGE.MONTH:
      start_date = dayjs(new Date()).startOf('month').toISOString();
      end_date = dayjs(new Date()).endOf('month').toISOString();
      break;
    case RANGE.YEAR:
      start_date = dayjs(new Date()).startOf('year').toISOString();
      end_date = dayjs(new Date()).endOf('year').toISOString();
      break;
    default:
      throw new Error('Unsupported Date Reange');
  }
  return prisma.$queryRaw`
  SELECT 
      (SELECT CAST(COUNT(*) AS INTEGER) FROM conversations WHERE  ${start_date}::timestamp < created_at AND created_at < ${end_date}::timestamp)  AS conversation_count,
      (SELECT CAST(COUNT(*) AS INTEGER) FROM messages WHERE  ${start_date}::timestamp < created_at AND created_at < ${end_date}::timestamp AND eval = 'bad') AS bad_message_count,
      (SELECT CAST(COUNT(*) AS INTEGER) FROM messages WHERE  ${start_date}::timestamp < created_at AND created_at < ${end_date}::timestamp AND eval = 'good') AS good_message_count,
      (SELECT CAST(COUNT(*) AS INTEGER) FROM leads WHERE  ${start_date}::timestamp < created_at AND created_at < ${end_date}::timestamp  AND organization_id = ${organizationId}) AS lead_count,
      (SELECT type FROM data_sources WHERE organization_id = ${organizationId} GROUP BY type ORDER BY COUNT(type) DESC LIMIT 1) AS most_common_datasource`;
}

// returns replies quality and conversation over time
function getReplyEvolution({ organizationId, range }: DbGetterArgs) {
  let start_date;
  let end_date;
  switch (range) {
    case RANGE.MONTH:
      start_date = dayjs(new Date()).startOf('month').toISOString();
      end_date = dayjs(new Date()).endOf('month').toISOString();
      return prisma.$queryRaw`
      SELECT
      EXTRACT(YEAR FROM m.created_at) as year,
      EXTRACT(DAY FROM m.created_at) as day,
      CAST(SUM(CASE WHEN eval = 'good' THEN 1 ELSE 0 END) AS INTEGER) as "good_count",
      CAST(SUM(CASE WHEN eval = 'bad' THEN 1 ELSE 0 END) AS INTEGER) as "bad_count"
      FROM messages m
      JOIN conversations c ON m.conversation_id = c.id
      WHERE
      m.created_at BETWEEN ${start_date}::timestamp AND ${end_date}::timestamp
      AND
      c.organization_id = ${organizationId}
      GROUP BY year, day
      ORDER BY year, day`;
    case RANGE.YEAR:
      start_date = dayjs(new Date()).startOf('year').toISOString();
      end_date = dayjs(new Date()).endOf('year').toISOString();
      return prisma.$queryRaw`
          SELECT
          EXTRACT(YEAR FROM m.created_at) as year,
          EXTRACT(MONTH FROM m.created_at) as month,
          CAST(SUM(CASE WHEN eval = 'good' THEN 1 ELSE 0 END) AS INTEGER) as "good_count",
          CAST(SUM(CASE WHEN eval = 'bad' THEN 1 ELSE 0 END) AS INTEGER) as "bad_count"
          FROM messages m
          JOIN conversations c ON m.conversation_id = c.id
          WHERE
          m.created_at BETWEEN ${start_date}::timestamp AND ${end_date}::timestamp
          AND
          c.organization_id = ${organizationId}
          GROUP BY year, month
          ORDER BY year, month`;
    default:
      throw new Error('Unsupported Date Reange');
  }
}

// returns total conversations over time
function getConversationEvolution({ organizationId, range }: DbGetterArgs) {
  let start_date;
  let end_date;
  switch (range) {
    case RANGE.MONTH:
      start_date = dayjs(new Date()).startOf('month').toISOString();
      end_date = dayjs(new Date()).endOf('month').toISOString();
      return prisma.$queryRaw`
          SELECT
          EXTRACT(YEAR FROM created_at) as year,
          EXTRACT(DAY FROM created_at) as day,
          CAST(COUNT(*) AS INTEGER) as "conversation_count"
          FROM Conversations
          WHERE
          created_at BETWEEN  ${start_date}::timestamp AND ${end_date}::timestamp
          AND
          organization_id = ${organizationId}
          GROUP BY year, day
          ORDER BY year, day`;
    case RANGE.YEAR:
      start_date = dayjs(new Date()).startOf('year').toISOString();
      end_date = dayjs(new Date()).endOf('year').toISOString();
      return prisma.$queryRaw`
          SELECT
          EXTRACT(YEAR FROM created_at) as year,
          EXTRACT(MONTH FROM created_at) as month,
          CAST(COUNT(*) AS INTEGER) as "conversation_count"
          FROM Conversations
          WHERE
          created_at BETWEEN  ${start_date}::timestamp AND ${end_date}::timestamp
          AND
          organization_id = ${organizationId}
          GROUP BY year, month
          ORDER BY year, month`;
    default:
      throw new Error('Unsupported Date Reange');
  }
}

export const getAnalytics = async (
  req: AppNextApiRequest,
  res: NextApiResponse
) => {
  try {
    const { view } = querySchema.parse(req.query);
    const { organization } = req.session;
    const cacheKey = `${view}:${organization.id}`;
    const redisClient = new RedisClient();
    const cachedValue = await redisClient.retriveKey(cacheKey);
    if (cachedValue) {
      return JSON.parse(cachedValue);
    }

    let results = [] as any;

    // batch read queries
    results = await prisma.$transaction([
      getKeyMetrics({
        organizationId: organization.id,
        range: view,
      }),
      getReplyEvolution({
        organizationId: organization.id,
        range: view,
      }),
      getConversationEvolution({
        organizationId: organization.id,
        range: view,
      }),
    ]);

    const [keyMetric, repliesEvolution, conversationEvolution] = results;
    const {
      conversation_count,
      bad_message_count,
      good_message_count,
      lead_count,
      most_common_datasource,
    } = keyMetric[0];

    redisClient.cacheKey({
      key: cacheKey,
      value: JSON.stringify({
        conversation_count,
        bad_message_count,
        good_message_count,
        lead_count,
        most_common_datasource,
        repliesEvolution,
        conversationEvolution,
      }),
      expiration: 60 * 60, // 1 hour
    });

    await redisClient.disconnect();

    return {
      conversation_count,
      bad_message_count,
      good_message_count,
      lead_count,
      most_common_datasource,
      repliesEvolution,
      conversationEvolution,
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
