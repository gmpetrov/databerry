// WARNING
// Doest not work well on serverless env like vercel
// The slack api requires a response in max 3s. They recommend sending a response ASAP and then do the work in the background
// But it is not possible with lambdas as the execution stops as soon as a response is returned
// A workaround woudl be to run on the Edge Network but it brings other issues
// (Langhchain not fully supported on Edge, Prisma woudl require to subscribe to Data Proxy, Migrate from axios to fetch)
//  + I think it's better to minimize dependency with other providers if we want to work on a full onpremise solution in the future
// ATM Dockerizing the app and host it on Fly.io for handling that type of use-cases

import { WebClient } from '@slack/web-api';
import axios from 'axios';
import { NextApiResponse } from 'next';

import { SearchRequestSchema } from '@app/types/dtos';
import { AppNextApiRequest } from '@app/types/index';
import chat from '@app/utils/chat';
import { createApiHandler, respond } from '@app/utils/createa-api-handler';
import { DatastoreManager } from '@app/utils/datastores';
import getSubdomain from '@app/utils/get-subdomain';
import prisma from '@app/utils/prisma-client';
import slackAgent from '@app/utils/slack-agent';
import summarize from '@app/utils/summarize';
import validate from '@app/utils/validate';

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

const getDatastoreyBySlackToken = async (token: string) => {
  const datastore = await prisma.datastore.findUnique({
    where: {
      id: 'clg0m4y0i000c0u4dmhf381s6',
    },
    include: {
      apiKeys: true,
    },
  });

  return datastore;
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
  const datastore = await getDatastoreyBySlackToken(payload.token);

  const args = payload.event.text.split(' ');
  // remove first element from array
  args.shift();

  const query = (args || []).join(' ');
  const cmd = args?.[0]?.toLowerCase();
  console.log('QUERUY---->', query);
  const slackClient = new WebClient(process.env.SLACK_BOT_TOKEN!);

  if (query) {
    sendLoader({
      client: slackClient,
      channel: payload.event.channel,
      thread_ts: payload.event.thread_ts,
    });

    const { answer } = await slackAgent({
      datastore: datastore as any,
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

  // if (cmd === 'summarize' || cmd === 'sum' || cmd === 's') {
  //   // TODO HANDLE SUMMARIZE

  // sendLoader({
  //   client: slackClient,
  //   channel: payload.event.channel,
  //   thread_ts: payload.event.thread_ts,
  // });

  // const response = await slackClient.conversations.history({
  //   channel: payload.event.channel,
  //   limit: 100,
  // });

  // const messages = response.messages?.reverse();

  // const ctx = [];
  // const usernames: Record<string, string> = {};

  //   for (const each of messages!) {
  //     //   const id = (each.user || each.bot_id) as string;

  //     //   if (!usernames[id]) {
  //     //     let username = id;

  //     //     if (each.user) {
  //     //       const res = await slackClient.users.info({ user: each.user! });
  //     //       username = res?.user?.name || each.user!;
  //     //     } else if (each.bot_id) {
  //     //       const res = await slackClient.bots.info({ bot: each.bot_id! });
  //     //       username = res?.bot?.name || each.bot_id!;
  //     //     }

  //     //     usernames[id] = username;
  //     //   }
  //     //   ctx.push(`From: ${usernames[id]}\nMessage: ${each.text}`);
  //     ctx.push(`Message: ${each.text}`);
  //   }

  //   // const context = messages
  //   //   ?.map((each) => `From: ${each.user}\nMessage: ${each.text}`)
  //   //   .join('\n\n');

  //   const { answer } = await summarize({ text: ctx.join('\n\n') });

  // await slackClient.chat.postMessage({
  //   channel: payload.event.channel,
  //   thread_ts: payload.event.thread_ts,
  //   text: `<@${payload.event.user}> ${answer}`,
  // });
  // } else if (query) {
  //   // just query the datastore

  //   // const loadingBlocks = [
  //   //   {
  //   //     type: 'section',
  //   //     text: {
  //   //       type: 'mrkdwn',
  //   //       text: ':hourglass_flowing_sand: Loading...',
  //   //     },
  //   //   },
  //   // ];

  //   // const loader = await slackClient.chat.postMessage({
  //   //   channel: payload.event.channel,
  //   //   thread_ts: payload.event.ts,
  //   //   blocks: loadingBlocks,
  //   // });

  //   await sendLoader({
  //     client: slackClient,
  //     channel: payload.event.channel,
  //     thread_ts: payload.event.thread_ts,
  //   });

  //   const { answer } = await chat({
  //     datastore: datastore as any,
  //     query,
  //   });

  //   // await slackClient.chat.update({
  //   //   ts: loader.ts!,
  //   //   channel: payload.event.channel,
  //   //   thread_ts: payload.event.ts,
  //   //   text: `<@${payload.event.user}> ${answer}`,
  //   // });
  //   await slackClient.chat.postMessage({
  //     channel: payload.event.channel,
  //     thread_ts: payload.event.thread_ts,
  //     text: `<@${payload.event.user}> ${answer}`,
  //   });
  // }
};

const handleAsk = async (payload: CommandEvent) => {
  if (!payload.text) {
    return;
  }

  const datastore = await getDatastoreyBySlackToken(payload.token);

  const { answer } = await chat({
    datastore: datastore as any,
    query: payload.text,
  });

  return axios.post(payload.response_url, {
    text: `${payload.text}\n\n${answer}`,
    response_type: 'in_channel',
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

  const channelId = req.body.channel_id as string;

  const slackClient = new WebClient(process.env.SLACK_BOT_TOKEN!);
  const limit = 100;

  try {
    const response = await slackClient.conversations.history({
      channel: channelId,
      limit: limit,
    });
    const messages = response.messages?.reverse();

    const context = messages
      ?.map((each) => `From: ${each.user}\nMessage: ${each.text}`)
      .join('\n\n');

    const datastore = await prisma.datastore.findUnique({
      where: {
        id: 'clg0m4y0i000c0u4dmhf381s6',
        // id: 'clg1xg2h80000l708dymr0fxc',
      },
      include: {
        apiKeys: true,
      },
    });

    const { answer } = await chat({
      datastore: datastore as any,
      query: `What's Daftpagae?`,
    });

    console.log('answer', answer);
  } catch (e) {
    console.log('ERROR', e);
  }

  //   const t = async () => {
  //     return new Promise((resolve) => {
  //       setTimeout(() => {
  //         resolve('world');
  //       }, 10000);
  //     });
  //   };

  //   await t();

  // return res.json({
  //   hello: 'world44444',
  // });
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
