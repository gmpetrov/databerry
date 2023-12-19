import dayjs from 'dayjs';

import { DatasourceType, MessageEval, Prisma } from '@chaindesk/prisma';
import prisma from '@chaindesk/prisma/client';

interface DbGetterArgs {
  organizationId: string;
  view: 'monthly' | 'all_time';
  agentId?: string;
}

export const currentMonth = {
  start: dayjs(new Date()).startOf('month').toISOString(),
  end: dayjs(new Date()).endOf('month').toISOString(),
};

/**
 * Retrieves the count of conversations based on the provided criteria.
 * @param organizationId
 * @param view monthly or all_time
 * @param agentId
 * @returns A promise that resolves to an array of objects containing the count of conversations.
 */
export function getConversationsCount(
  args: DbGetterArgs
): Prisma.PrismaPromise<{ count: number }[]> {
  return prisma.$queryRaw(
    Prisma.sql`
    select cast(count(*) as integer)
    from conversations
    where  
    organization_id = ${args.organizationId}
    ${
      args.view == 'monthly'
        ? Prisma.sql`and created_at between ${currentMonth.start}::timestamp and ${currentMonth.end}::timestamp`
        : Prisma.empty
    }
    ${args.agentId ? Prisma.sql`and agent_id = ${args.agentId}` : Prisma.empty}`
  );
}

/**
 * Retrieves the count of messages by evaluation type based on the provided criteria.
 * @param organizationId - The organization ID.
 * @param view - The view, either 'monthly' or 'all_time'.
 * @param agentId - (Optional) The agent ID.
 * @param eval - The evaluation type of the message.
 * @returns A promise that resolves to an array of objects containing the count of messages.
 */
export function getMsgCountByEval(
  args: DbGetterArgs & { eval: MessageEval }
): Prisma.PrismaPromise<{ count: number }[]> {
  return prisma.$queryRaw(
    Prisma.sql`select cast(count(*) as integer)
    from messages as msg
    left join conversations as conv on msg.conversation_id = conv.id
    where conv.organization_id = ${args.organizationId}
      ${
        args.agentId
          ? Prisma.sql`and conv.agent_id = ${args.agentId}`
          : Prisma.empty
      }
      ${
        args.view == 'monthly'
          ? Prisma.sql`and msg.created_at between ${currentMonth.start}::timestamp and ${currentMonth.end}::timestamp`
          : Prisma.empty
      }
      and msg.eval::text = ${args.eval}`
  );
}

/**
 * Retrieves the count of leads based on the provided criteria.
 * @param organizationId - The organization ID.
 * @param view - The view, either 'monthly' or 'all_time'.
 * @param agentId - (Optional) The agent ID.
 * @returns A promise that resolves to an array of objects containing the count of leads.
 */
export function getLeadCount(
  args: DbGetterArgs
): Prisma.PrismaPromise<{ count: number }[]> {
  return prisma.$queryRaw(
    Prisma.sql`
    select cast(count(*) as integer)
    from leads
    where organization_id = ${args.organizationId} 
    ${
      args.view == 'monthly'
        ? Prisma.sql`and created_at between ${currentMonth.start}::timestamp and ${currentMonth.end}::timestamp`
        : Prisma.empty
    }
    ${args.agentId ? Prisma.sql`and agent_id = ${args.agentId}` : Prisma.empty}`
  );
}

/**
 * Retrieves the count of visits per country based on the provided criteria.
 * @param organizationId - The organization ID.
 * @param view - The view, either 'monthly' or 'all_time'.
 * @param agentId - (Optional) The agent ID.
 * @returns A promise that resolves to an array of objects containing the count of visits per country.
 */
export function getVisitsPerCountry({
  organizationId,
  view,
  agentId,
}: DbGetterArgs) {
  let start_date;
  let end_date;
  start_date = dayjs(new Date()).startOf('month').toISOString();
  end_date = dayjs(new Date()).endOf('month').toISOString();

  const rawSql = Prisma.sql`
    select 
      metadata->>'country' as country,  
      cast(count(*) as integer) as visits
    from 
      conversations
    where 
      organization_id = ${organizationId}
      ${
        view == 'monthly'
          ? Prisma.sql` and created_at between ${start_date}::timestamp and ${end_date}::timestamp`
          : Prisma.empty
      }
      ${agentId ? Prisma.sql`and agent_id = ${agentId}` : Prisma.empty}
    group by 
      metadata->>'country'
  `;

  return prisma.$queryRaw(rawSql);
}

/**
 * Retrieves the evolution of replies based on the provided criteria.
 * @param organizationId - The organization ID.
 * @param view - The view, either 'monthly' or 'all_time'.
 * @param agentId - (Optional) The agent ID.
 * @returns A promise that resolves to an array of objects containing the evolution of replies.
 */
export function getReplyEvolution({
  organizationId,
  view,
  agentId,
}: DbGetterArgs): Prisma.PrismaPromise<
  {
    month: number;
    day: number;
    year: number;
    good_count: number;
    bad_count: number;
  }[]
> {
  const rawSql = Prisma.sql`
    select
      ${
        view == 'monthly'
          ? Prisma.sql`extract(month from m.created_at) as month,`
          : Prisma.sql`extract(year from m.created_at) as year,`
      }
      ${
        view == 'monthly'
          ? Prisma.sql`extract(day from m.created_at) as day,`
          : Prisma.sql`extract(month from m.created_at) as month,`
      }
      cast(sum(case when eval = 'good' then 1 else 0 end) as integer) as "good_count",
      cast(sum(case when eval = 'bad' then 1 else 0 end) as integer) as "bad_count"
    from messages m
    left join conversations c on m.conversation_id = c.id
    where c.organization_id = ${organizationId}
    ${agentId ? Prisma.sql`and c.agent_id = ${agentId}` : Prisma.empty}
    ${
      view == 'monthly'
        ? Prisma.sql`and  m.created_at between ${currentMonth.start}::timestamp and ${currentMonth.end}::timestamp`
        : Prisma.empty
    }
    ${
      view == 'monthly'
        ? Prisma.sql`group by month, day`
        : Prisma.sql`group by year, month`
    }
    ${
      view == 'monthly'
        ? Prisma.sql`order by  month, day`
        : Prisma.sql`order by  year, month`
    }
  `;

  return prisma.$queryRaw(rawSql);
}

/**
 * Retrieves the evolution of conversations based on the provided criteria.
 * @param organizationId - The organization ID.
 * @param view - The view, either 'monthly' or 'all_time'.
 * @param agentId - (Optional) The agent ID.
 * @returns A promise that resolves to an array of objects containing the evolution of conversations.
 */
export function getConversationEvolution({
  organizationId,
  view,
  agentId,
}: DbGetterArgs): Prisma.PrismaPromise<
  {
    month: number;
    day: number;
    year: number;
    conversation_count: number;
  }[]
> {
  const rawSql = Prisma.sql`
    select
      ${
        view == 'monthly'
          ? Prisma.sql`extract(month from created_at) as month,`
          : Prisma.sql`extract(year from created_at) as year,`
      }
      ${
        view == 'monthly'
          ? Prisma.sql`extract(day from created_at) as day,`
          : Prisma.sql`extract(month from created_at) as month,`
      }
      cast(count(*) as integer) as "conversation_count"
    from conversations
    where organization_id = ${organizationId}
    ${agentId ? Prisma.sql`and agent_id = ${agentId}` : Prisma.empty}
    ${
      view == 'monthly'
        ? Prisma.sql`and created_at between ${currentMonth.start}::timestamp and ${currentMonth.end}::timestamp`
        : Prisma.empty
    }
    ${
      view == 'monthly'
        ? Prisma.sql`group by month, day`
        : Prisma.sql`group by year, month`
    }
    ${
      view == 'monthly'
        ? Prisma.sql`order by month, day`
        : Prisma.sql`order by year, month`
    }
  `;
  return prisma.$queryRaw(rawSql);
}

/*
 How it is computed:
   1- look for the agent with most conversation. (hence most used.)
   2- look for the most used datastore for that specific agent.
   3- look for the most predominant datasource fot  that specific datastore.
*/
export function getMostUsedDatasource(
  args: DbGetterArgs
): Prisma.PrismaPromise<{ type: DatasourceType }[]> {
  return prisma.$queryRaw(
    Prisma.sql`
    select ds.type, count(*)
    from data_sources ds
    where ds.datastore_id in
      (select t.datastore_id
        from tools t
        where t.type = 'datastore'
          ${
            args.agentId
              ? Prisma.sql`and t.agent_id = ${args.agentId}`
              : Prisma.sql`and t.agent_id = (
                select a.id
                from agents a
                left join conversations c on a.id = c.agent_id
                where a.organization_id = ${args.organizationId}
                ${
                  args.view == 'monthly'
                    ? Prisma.sql`and c.created_at BETWEEN ${currentMonth.start}::timestamp AND ${currentMonth.end}::timestamp`
                    : Prisma.empty
                }
                group by a.id
                order by COUNT(c.id) desc
                limit 1
              )`
          }
      )
    group by ds."type"
    order by COUNT(*) desc
    limit 1
    `
  );
}
