import { MessageEval } from '@prisma/client';
import { NextApiResponse } from 'next';
import { z, ZodError } from 'zod';

import {
  getConversationEvolution,
  getConversationsCount,
  getLeadCount,
  getMostUsedDatasource,
  getMsgCountByEval,
  getReplyEvolution,
  getVisitsPerCountry,
} from '@chaindesk/lib/analytics';
import Cache from '@chaindesk/lib/cache';
import {
  createAuthApiHandler,
  respond,
} from '@chaindesk/lib/createa-api-handler';
import { AppNextApiRequest } from '@chaindesk/lib/types';
import prisma from '@chaindesk/prisma/client';
const handler = createAuthApiHandler();

const querySchema = z.object({
  view: z.enum(['monthly', 'all_time']),
  agentId: z.string(),
});

export const getAnalytics = async (
  req: AppNextApiRequest,
  res: NextApiResponse
) => {
  try {
    const { view, agentId } = querySchema.parse(req.query);

    const {
      organization: { id: organizationId },
    } = req.session;

    const cacheKey = `${organizationId}:${agentId}:${view}`;
    const cache = new Cache();
    const cachedValue = await cache.get(cacheKey);

    if (process.env.NODE_ENV === 'production' && cachedValue) {
      return JSON.parse(cachedValue);
    }

    // const  getMostUsedDatasource({ view, agentId, organizationId });
    // batch read queries
    const [
      conversation_count,
      bad_message_count,
      good_message_count,
      lead_count,
      most_common_datasource,
      repliesEvolution,
      conversationEvolution,
      visitsPerCountry,
    ] = await prisma.$transaction([
      getConversationsCount({ organizationId, view, agentId }),
      getMsgCountByEval({
        organizationId,
        agentId,
        view,
        eval: MessageEval.bad,
      }),
      getMsgCountByEval({
        organizationId,
        agentId,
        view,
        eval: MessageEval.good,
      }),
      getLeadCount({ organizationId, agentId, view }),
      getMostUsedDatasource({ organizationId, agentId, view }),
      getReplyEvolution({
        organizationId,
        view,
        agentId,
      }),
      getConversationEvolution({
        organizationId: organizationId,
        view,
        agentId,
      }),
      getVisitsPerCountry({
        organizationId: organizationId,
        view,
        agentId,
      }),
    ]);

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
      conversation_count: conversation_count?.[0]?.count,
      bad_message_count: bad_message_count?.[0]?.count,
      good_message_count: good_message_count?.[0]?.count,
      lead_count: lead_count?.[0]?.count,
      most_common_datasource: most_common_datasource?.[0]?.type,
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
