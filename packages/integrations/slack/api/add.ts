import { NextApiResponse } from 'next/types';
import { AppNextApiRequest } from '@chaindesk/lib/types';
import { createAuthApiHandler } from '@chaindesk/lib/createa-api-handler';

const handler = createAuthApiHandler();

export const add = (req: AppNextApiRequest, res: NextApiResponse) => {
  const session = req.session;
  const agentId = req.query.agentId as string;

  const url = `https://slack.com/oauth/v2/authorize?client_id=${
    process.env.NEXT_PUBLIC_SLACK_CLIENT_ID
  }&scope=app_mentions:read,channels:history,groups:history,chat:write,commands,users:read&redirect_uri=${
    process.env.NEXT_PUBLIC_DASHBOARD_URL
  }/api/integrations/slack/callback&state=${JSON.stringify({
    organizationId: session?.organization.id,
    agentId,
  })}`;

  return res.json({
    url,
  });
};

handler.get(add);

export default handler;
