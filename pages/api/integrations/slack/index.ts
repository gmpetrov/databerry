// WARNING
// Doest not work well on serverless env like vercel
// The slack api requires a response in max 3s. They recommend sending a response ASAP and then do the work in the background
// But it is not possible with lambdas as the execution stops as soon as a response is returned
// A workaround woudl be to run on the Edge Network but it brings other issues
// (Langhchain not fully supported on Edge, Prisma woudl require to subscribe to Data Proxy, Migrate from axios to fetch)
//  + I think it's better to minimize dependency with other providers if we want to work on a full onpremise solution in the future
// ATM Dockerizing the app and host it on Fly.io for handling that type of use-cases
import {
  ConversationChannel,
  MessageFrom,
  SubscriptionPlan,
} from '@prisma/client';
import { WebClient } from '@slack/web-api';
import axios from 'axios';
import cuid from 'cuid';
import { NextApiResponse } from 'next';

import { AppNextApiRequest } from '@app/types/index';
import AgentManager from '@app/utils/agent';
import ConversationManager from '@app/utils/conversation';
import { createApiHandler, respond } from '@app/utils/createa-api-handler';
import formatSourcesRawText from '@app/utils/form-sources-raw-text';
import guardAgentQueryUsage from '@app/utils/guard-agent-query-usage';
import prisma from '@app/utils/prisma-client';
import slackAgent from '@app/utils/slack-agent';

const handler = createApiHandler();

type CommandEvent = {
  token: string;
  team_id: string;
  team_domain: string;
  channel_id: string;
  channel_name: string;
  user_id: string;
  user_name: string;
  command: string;
  text: string;
  api_app_id: string;
  is_enterprise_install: string;
  response_url: string;
  trigger_id: string;
};

type MentionEvent = {
  type: string;
  event_id: string;
  event_time: number;
  token: string;
  team_id: string;
  api_app_id: string;
  is_ext_shared_channel: boolean;
  event_context: string;
  event: {
    client_msg_id: string;
    type: 'app_mention';
    text: string;
    user: string;
    ts: string;
    blocks: [[Object]];
    team: string;
    channel: string;
    event_ts: string;
    thread_ts?: string;
  };
};

class SlackUtils {
  client: WebClient;

  constructor({ token }: { token: string }) {
    this.client = new WebClient(token);
  }

  sendLoader(props: { channel: string; ts: string; blocks: any }) {
    const loadingBlocks = [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: ':hourglass_flowing_sand: Loading...',
        },
      },
    ];

    return this.client.chat.postMessage({
      channel: props.channel,
      thread_ts: props.ts,
      blocks: loadingBlocks,
    });
  }
}

const getIntegrationByTeamId = async (teamId: string) => {
  const integration = await prisma.externalIntegration.findUnique({
    where: {
      integrationId: `sl_${teamId}`,
    },
    include: {
      agent: {
        include: {
          owner: {
            include: {
              usage: true,
              subscriptions: true,
            },
          },
          tools: {
            include: {
              datastore: true,
            },
          },
        },
      },
    },
  });

  if (!integration?.agent) {
    throw new Error('No agent found');
  }

  return integration;
};

const sendLoader = (props: {
  client: WebClient;
  channel: string;
  thread_ts?: string;
}) => {
  const loadingBlocks = [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: ':hourglass_flowing_sand: Loading...',
      },
    },
  ];

  return props.client.chat.postMessage({
    channel: props.channel,
    thread_ts: props.thread_ts,
    blocks: loadingBlocks,
  });
};

const handleMention = async (payload: MentionEvent) => {
  const integration = await getIntegrationByTeamId(payload.team_id);
  const agent = integration?.agent;

  const args = payload.event.text.split(' ');
  // remove first element from array
  args.shift();

  const query = (args || []).join(' ');
  const cmd = args?.[0]?.toLowerCase();
  console.log('QUERUY---->', query);
  const slackClient = new WebClient(integration?.integrationToken!);

  try {
    const usage = agent?.owner?.usage!;
    const plan =
      agent?.owner?.subscriptions?.[0]?.plan || SubscriptionPlan.level_0;

    guardAgentQueryUsage({
      usage,
      plan,
    });
  } catch (err) {
    console.log(err);

    return await slackClient.chat.postMessage({
      channel: payload.event.channel,
      thread_ts: payload.event.thread_ts,
      text: `<@${payload.event.user}> Usage limit reached. Please upgrade your plan to continue using the bot.`,
    });
  }

  if (query) {
    sendLoader({
      client: slackClient,
      channel: payload.event.channel,
      thread_ts: payload.event.thread_ts,
    });

    const { answer } = await slackAgent({
      agent: agent!,
      input: query,

      client: slackClient,
      channel: payload.event.channel,
      ts: payload.event.ts,
    });

    await slackClient.chat.postMessage({
      channel: payload.event.channel,
      thread_ts: payload.event.thread_ts,
      text: `<@${payload.event.user}> ${answer}`,
    });
  }
};

const handleAsk = async (payload: CommandEvent) => {
  if (!payload.text) {
    return;
  }

  const integration = await getIntegrationByTeamId(payload.team_id);
  const agent = integration?.agent!;

  const conversation = await prisma.conversation.findFirst({
    where: {
      AND: [{ agentId: agent?.id }, { visitorId: payload.user_id }],
    },
  });

  const conversationId = conversation?.id;

  const conversationManager = new ConversationManager({
    conversationId,
    agentId: agent?.id!,
    visitorId: payload.user_id,
    channel: ConversationChannel.slack,
  });

  conversationManager.push({
    from: MessageFrom.human,
    text: payload.text,
  });

  const chatRes = await new AgentManager({ agent }).query({
    input: payload.text,
  });

  conversationManager.push({
    from: MessageFrom.agent,
    text: chatRes?.answer,
  });

  conversationManager.save();

  const finalAnser = `${chatRes?.answer}\n\n${formatSourcesRawText(
    chatRes?.sources
  )}`.trim();

  return axios.post(payload.response_url, {
    text: `${payload.text}\n\n${finalAnser}`,
    // response_type: 'in_channel',
    response_type: 'ephemeral',
  });
};

export const slack = async (req: AppNextApiRequest, res: NextApiResponse) => {
  console.log('PAYLOAD', req.body);

  if (req.body?.type === 'url_verification') {
    return res.json({ challenge: `${req.body?.challenge}` });
  }

  // Return ASAP so that Slack does not timeout
  res.status(200).send('Loading...');

  if (req.body?.type === 'event_callback') {
    if (req.body?.event?.type === 'app_mention') {
      // TODO HANDLE mention
      return handleMention(req.body);
    }

    return {};
  } else if (req.body?.command === '/ask') {
    return handleAsk(req.body);
  }

  return {};
};

handler.post(slack);

export default handler;

// {
//     token: '1XKAxGolQBBhlPy5aJUrZnf8',
//     team_id: 'T0F2WGXSA',
//     team_domain: '42-legends',
//     channel_id: 'C0F2QMH5J',
//     channel_name: 'general',
//     user_id: 'U0F2X9BCJ',
//     user_name: 'gmp',
//     command: '/datatest',
//     text: '',
//     api_app_id: 'A052H2S3NRE',
//     is_enterprise_install: 'false',
//     response_url: 'https://hooks.slack.com/commands/T0F2WGXSA/5085544918768/CFb1WEvCwia7g8KcqlhGqxHT',
//     trigger_id: '5061732680851.15098575894.9737c1ef3ad4d5155aba8f4b70966f69'
//   }
// [
//     {
//       type: 'message',
//       subtype: 'channel_join',
//       ts: '1680642109.614019',
//       user: 'U052HA8MLSU',
//       text: '<@U052HA8MLSU> has joined the channel',
//       inviter: 'U0F2X9BCJ'
//     },
//     {
//       client_msg_id: '5214f84d-a4e2-45a3-a293-f9811cf61b0c',
//       type: 'message',
//       text: 'Ceci est un test',
//       user: 'U0F2X9BCJ',
//       ts: '1680640883.414959',
//       blocks: [ [Object] ],
//       team: 'T0F2WGXSA'
//     },
//     {
//       client_msg_id: 'bd00800e-f917-4bac-a7fd-1b53cb747f74',
//       type: 'message',
//       text: 'Hello World',
//       user: 'U0F2X9BCJ',
//       ts: '1680640875.910879',
//       blocks: [ [Object] ],
//       team: 'T0F2WGXSA'
//     }
//   ]
