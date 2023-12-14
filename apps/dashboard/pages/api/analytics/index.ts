import { MessageEval, PrismaPromise } from '@prisma/client';
import dayjs from 'dayjs';
import { NextApiResponse } from 'next';
import { z, ZodError } from 'zod';

import Cache from '@chaindesk/lib/cache';
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
  agent_id: z.string(),
});

interface DbGetterArgs {
  organizationId: string;
  range: 'month' | 'year';
  agentId?: string;
}

// returns total conversations,liked replies, disliked replies, leads generated, most used datasource
function getKeyMetrics({ organizationId, range, agentId }: DbGetterArgs) {
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
      throw new Error('Unsupported Date Range');
  }

  if (agentId) {
    return prisma.$queryRaw`
    SELECT 
      (SELECT CAST(COUNT(*) AS INTEGER) FROM conversations 
        WHERE created_at BETWEEN ${start_date}::timestamp AND ${end_date}::timestamp
        AND agent_id = ${agentId})
      AS conversation_count,
      (SELECT CAST(COUNT(*) AS INTEGER) 
        FROM messages as msg 
        LEFT JOIN conversations AS conv 
        ON msg.conversation_id = conv.id
          WHERE msg.created_at BETWEEN  ${start_date}::timestamp AND ${end_date}::timestamp
          AND msg.created_at < ${end_date}::timestamp 
          AND msg.eval = 'bad' 
          AND conv.agent_id = ${agentId})
      AS bad_message_count,
      (SELECT CAST(COUNT(*) AS INTEGER) 
      FROM messages as msg 
      LEFT JOIN conversations AS conv 
      ON msg.conversation_id = conv.id
        WHERE msg.created_at BETWEEN  ${start_date}::timestamp AND ${end_date}::timestamp
        AND msg.created_at < ${end_date}::timestamp 
        AND msg.eval = 'good' 
        AND conv.agent_id = ${agentId})
      AS good_message_count,
      (
        SELECT CAST(COUNT(*) AS INTEGER) FROM leads 
        WHERE created_at BETWEEN  ${start_date}::timestamp AND ${end_date}::timestamp  
        AND organization_id = ${organizationId}
        AND agent_id = ${agentId}
      )
      AS lead_count,
      (
        SELECT ads.type FROM data_sources ads 
         JOIN (
                SELECT ds.id FROM data_stores ds 
                JOIN  tools   ON ds.id = tools.datastore_id
                JOIN  data_sources source ON ds.id = source.datastore_id
                WHERE tools.agent_id = ${agentId}
                GROUP BY source.type , ds.id
               ORDER BY COUNT(*) DESC
             )  
         most_used_ds ON most_used_ds.id = ads.datastore_id  
         GROUP BY ads.type
         ORDER BY COUNT(*) DESC LIMIT 1
      ) 
      AS most_common_datasource
     `;
  } else {
    return prisma.$queryRaw`
    SELECT 
      (
        SELECT CAST(COUNT(*) AS INTEGER) FROM conversations 
        WHERE created_at BETWEEN ${start_date}::timestamp AND ${end_date}::timestamp
      )
      AS conversation_count,
      (
        SELECT CAST(COUNT(*) AS INTEGER) 
        FROM messages 
        WHERE created_at BETWEEN ${start_date}::timestamp AND ${end_date}::timestamp 
        AND eval = 'bad'
      )
      AS bad_message_count,
      (
        SELECT CAST(COUNT(*) AS INTEGER) 
        FROM messages 
        WHERE created_at BETWEEN ${start_date}::timestamp  AND ${end_date}::timestamp 
        AND eval = 'good'
      ) 
      AS good_message_count,
      (
      SELECT CAST(COUNT(*) AS INTEGER) 
      FROM leads 
      WHERE created_at BETWEEN  ${start_date}::timestamp  AND  ${end_date}::timestamp  
      AND organization_id = ${organizationId}
      )  
      AS lead_count,
      (
       SELECT source.type 
       FROM data_sources source 
          JOIN (
              SELECT ds.id FROM data_stores ds JOIN data_sources source ON ds.id = source.datastore_id 
              GROUP BY ds.id ORDER BY COUNT(source.type) DESC LIMIT 1
            ) most_used_ds ON most_used_ds.id = source.datastore_id LIMIT 1
      ) 
      AS most_common_datasource
     `;
  }
}

// returns replies quality and conversation over time
function getReplyEvolution({ organizationId, range, agentId }: DbGetterArgs) {
  let start_date;
  let end_date;
  switch (range) {
    case RANGE.MONTH:
      start_date = dayjs(new Date()).startOf('month').toISOString();
      end_date = dayjs(new Date()).endOf('month').toISOString();
      if (agentId) {
        return prisma.$queryRaw`
        SELECT
        EXTRACT(MONTH FROM m.created_at) as month,
        EXTRACT(DAY FROM m.created_at) as day,
        CAST(SUM(CASE WHEN eval = 'good' THEN 1 ELSE 0 END) AS INTEGER) as "good_count",
        CAST(SUM(CASE WHEN eval = 'bad' THEN 1 ELSE 0 END) AS INTEGER) as "bad_count"
        FROM messages m
        JOIN conversations c ON m.conversation_id = c.id
        WHERE
        m.created_at BETWEEN ${start_date}::timestamp AND ${end_date}::timestamp
        AND
        c.organization_id = ${organizationId}
        AND
        c.agent_id = ${agentId}
        GROUP BY month, day
        ORDER BY month, day`;
      } else {
        return prisma.$queryRaw`
        SELECT
        EXTRACT(MONTH FROM m.created_at) as month,
        EXTRACT(DAY FROM m.created_at) as day,
        CAST(SUM(CASE WHEN eval = 'good' THEN 1 ELSE 0 END) AS INTEGER) as "good_count",
        CAST(SUM(CASE WHEN eval = 'bad' THEN 1 ELSE 0 END) AS INTEGER) as "bad_count"
        FROM messages m
        JOIN conversations c ON m.conversation_id = c.id
        WHERE
        m.created_at BETWEEN ${start_date}::timestamp AND ${end_date}::timestamp
        AND
        c.organization_id = ${organizationId}
        GROUP BY month, day
        ORDER BY month, day`;
      }

    case RANGE.YEAR:
      start_date = dayjs(new Date()).startOf('year').toISOString();
      end_date = dayjs(new Date()).endOf('year').toISOString();
      if (agentId) {
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
        AND
        c.agent_id = ${agentId}
        GROUP BY year, month
        ORDER BY year, month`;
      } else {
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
      }

    default:
      throw new Error('Unsupported Date Reange');
  }
}

// returns total conversations over time
function getConversationEvolution({
  organizationId,
  range,
  agentId,
}: DbGetterArgs) {
  let start_date;
  let end_date;
  switch (range) {
    case RANGE.MONTH:
      start_date = dayjs(new Date()).startOf('month').toISOString();
      end_date = dayjs(new Date()).endOf('month').toISOString();
      if (agentId) {
        return prisma.$queryRaw`
        SELECT
        EXTRACT(MONTH FROM created_at) as month,
        EXTRACT(DAY FROM created_at) as day,
        CAST(COUNT(*) AS INTEGER) as "conversation_count"
        FROM Conversations
        WHERE
        created_at BETWEEN  ${start_date}::timestamp AND ${end_date}::timestamp
        AND
        organization_id = ${organizationId}
        ANd
        agent_id = ${agentId}
        GROUP BY month, day
        ORDER BY month, day`;
      } else {
        return prisma.$queryRaw`
        SELECT
        EXTRACT(MONTH FROM created_at) as month,
        EXTRACT(DAY FROM created_at) as day,
        CAST(COUNT(*) AS INTEGER) as "conversation_count"
        FROM Conversations
        WHERE
        created_at BETWEEN  ${start_date}::timestamp AND ${end_date}::timestamp
        AND
        organization_id = ${organizationId}
        GROUP BY month, day
        ORDER BY month, day`;
      }

    case RANGE.YEAR:
      start_date = dayjs(new Date()).startOf('year').toISOString();
      end_date = dayjs(new Date()).endOf('year').toISOString();

      if (agentId) {
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
        AND
        agent_id = ${agentId}
        GROUP BY year, month
        ORDER BY year, month`;
      } else {
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
      }

    default:
      throw new Error('Unsupported Date Reange');
  }
}

function getVisitsPerCountry({ organizationId, range, agentId }: DbGetterArgs) {
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
  if (agentId) {
    return prisma.$queryRaw`
    SELECT metadata->>'country' as country,  CAST(COUNT(*) AS INTEGER) as visits
    FROM conversations
    WHERE created_at BETWEEN ${start_date}::timestamp AND ${end_date}::timestamp
    AND
    organization_id = ${organizationId}
    AND
    agent_id = ${agentId}
    GROUP BY metadata->>'country'
    `;
  } else {
    return prisma.$queryRaw`
    SELECT metadata->>'country' as country,  CAST(COUNT(*) AS INTEGER) as visits
    FROM conversations
    WHERE created_at BETWEEN ${start_date}::timestamp AND ${end_date}::timestamp
    AND
    organization_id = ${organizationId}
    GROUP BY metadata->>'country'
    `;
  }
}

export const getAnalytics = async (
  req: AppNextApiRequest,
  res: NextApiResponse
) => {
  try {
    const { view, agent_id } = querySchema.parse(req.query);

    const { organization } = req.session;

    //TODO: generate cuid from cuids.
    const cacheKey = `${view}:${organization.id}:${agent_id}`;
    const cache = new Cache();
    const cachedValue = await cache.get(cacheKey);

    if (process.env.NODE_ENV === 'production' && cachedValue) {
      return JSON.parse(cachedValue);
    }

    let results = [] as any;

    // batch read queries
    results = await prisma.$transaction([
      getKeyMetrics({
        organizationId: organization.id,
        range: view,
        agentId: agent_id,
      }),
      getReplyEvolution({
        organizationId: organization.id,
        range: view,
        agentId: agent_id,
      }),
      getConversationEvolution({
        organizationId: organization.id,
        range: view,
        agentId: agent_id,
      }),
      getVisitsPerCountry({
        organizationId: organization.id,
        range: view,
        agentId: agent_id,
      }),
    ]);

    const [
      keyMetric,
      repliesEvolution,
      conversationEvolution,
      visitsPerCountry,
    ] = results;

    const {
      conversation_count,
      bad_message_count,
      good_message_count,
      lead_count,
      most_common_datasource,
    } = keyMetric[0];

    const sortedVisitsPerCountry = (
      visitsPerCountry as { country: string; visits: number }[]
    )
      .map((visit) => Object.values(visit))
      .sort((a, b) => {
        const byVisit = (b[1] as number) - (a[1] as number);

        if (byVisit === 0) {
          // alphabetical order
          return (a[0] as string)?.localeCompare(b[0] as string);
        }
        // order by visits desc
        return byVisit;
      });

    const result = {
      conversation_count,
      bad_message_count,
      good_message_count,
      lead_count,
      most_common_datasource,
      repliesEvolution,
      conversationEvolution,
      visitsPerCountry: sortedVisitsPerCountry,
    };

    cache.set({
      key: cacheKey,
      value: JSON.stringify(result),
      expiration: 60 * 60, // 1 hour
    });

    return result;
  } catch (e) {
    if (e instanceof ZodError) {
      throw { status: 400, message: e.formErrors.fieldErrors };
    }
    throw e;
  }
};

handler.get(respond(getAnalytics));
export default handler;
