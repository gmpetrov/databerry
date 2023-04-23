import { SubscriptionPlan } from '@prisma/client';
import Crisp from 'crisp-api';
import cuid from 'cuid';
import { NextApiResponse } from 'next';

import { AppNextApiRequest } from '@app/types/index';
import AgentManager from '@app/utils/agent';
import { createApiHandler } from '@app/utils/createa-api-handler';
import getSubdomain from '@app/utils/get-subdomain';
import guardAgentQueryUsage from '@app/utils/guard-agent-query-usage';
import prisma from '@app/utils/prisma-client';
import validate from '@app/utils/validate';

const handler = createApiHandler();

const CrispClient = new Crisp();

CrispClient.authenticateTier(
  'plugin',
  process.env.CRISP_TOKEN_ID!,
  process.env.CRISP_TOKEN_KEY!
);

// Set current RTM mode to Web Hooks
CrispClient.setRtmMode(Crisp.RTM_MODES.WebHooks);

type HookEventType =
  | 'message:send'
  | 'message:updated'
  | 'message:compose:send'
  | 'message:notify:unread:send'
  | 'message:acknowledge:delivered';

type HookDataType = 'text';

type HookFrom = 'user' | 'operator';

type HookBodyBase = {
  website_id: string;
  event: HookEventType;
  timestamp: number;
  data: {
    [key: string]: any;
  };
};

type HookBodyMessageSent = HookBodyBase & {
  event: Extract<HookEventType, 'message:send'>;
  data: {
    type: HookDataType;
    origin: string;
    content: string;
    fingerprint: number;
    from: HookFrom;
    user: {
      nickname: string;
      user_id: string;
    };
    stamped: boolean;
    session_id: string;
    website_id: string;
  };
};

type HookBodyMessageUpdated = HookBodyBase & {
  event: Extract<HookEventType, 'message:updated'>;
  data: {
    content: {
      id: string;
      text: string;
      explain: string;
      value?: string;
    };
    fingerprint: number;
    session_id: string;
    website_id: string;
  };
};

type HookBody = HookBodyBase | HookBodyMessageSent | HookBodyMessageUpdated;

const getAgent = async (websiteId: string) => {
  const integration = await prisma.externalIntegration.findUnique({
    where: {
      integrationId: websiteId,
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

  const agent = integration?.agent;

  if (!agent) {
    throw new Error('Datastore not found');
  }

  return agent;
};

const handleSendInput = async (
  websiteId: string,
  sessionId: string,
  value?: string
) => {
  await CrispClient.website.sendMessageInConversation(websiteId, sessionId, {
    type: 'field',
    from: 'operator',
    origin: 'chat',
    user: {
      type: 'website',
      nickname: 'Databerry.ai',
      avatar: 'https://databerry.ai/databerry-rounded-bg-white.png',
    },

    content: {
      id: `databerry-query-${cuid()}`,
      text: '✨ Ask Databerry.ai',
      explain: 'Query',
      value,
    },
  });
};

const handleQuery = async (
  websiteId: string,
  sessionId: string,
  query: string
) => {
  const agent = await getAgent(websiteId);

  const usage = agent?.owner?.usage!;
  const plan =
    agent?.owner?.subscriptions?.[0]?.plan || SubscriptionPlan.level_0;

  try {
    guardAgentQueryUsage({
      usage,
      plan,
    });
  } catch {
    return await CrispClient.website.sendMessageInConversation(
      websiteId,
      sessionId,
      {
        type: 'text',
        from: 'operator',
        origin: 'chat',
        content: 'Usage limit reached.',
      }
    );
  }

  const answer = await new AgentManager({ agent }).query(query);

  await CrispClient.website.sendMessageInConversation(websiteId, sessionId, {
    type: 'text',
    from: 'operator',
    origin: 'chat',
    content: answer,
  });

  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      await handleSendInput(websiteId, sessionId);
      resolve(42);
    }, 300);
  });
};

export const hook = async (req: AppNextApiRequest, res: NextApiResponse) => {
  const host = req?.headers?.['host'];
  const subdomain = getSubdomain(host!);
  const body = req.body as HookBody;

  console.log('BODY', body);

  const _timestamp = req.headers['x-crisp-request-timestamp'];
  const _signature = req.headers['x-crisp-signature'];

  const verified = CrispClient.verifyHook(
    process.env.CRISP_HOOK_SECRET!,
    body,
    _timestamp as any,
    _signature as any
  );

  if (!verified) {
    // TODO
    // ATM verifyHook() always returns false 🤔
  }

  const messages = await CrispClient.website.getMessagesInConversation(
    body.website_id,
    body.data.session_id,
    body.timestamp
  );

  const hasSentDataberryInputOnce = !!messages?.find((msg: any) =>
    msg?.content?.id?.startsWith?.('databerry-query')
  );
  //   const nbUserMsg =
  //     messages?.filter((msg: any) => msg?.from === 'user')?.length || 0;

  console.log('HEADERS', req.headers);

  if (req.headers['x-delivery-attempt-count'] !== '1') {
    return res.status(200).json({
      hello: 'world',
    });
  }

  switch (body.event) {
    case 'message:send':
      if (
        body.data.origin === 'chat' &&
        body.data.from === 'user' &&
        body.data.type === 'text'
      ) {
        if (!hasSentDataberryInputOnce) {
          await handleSendInput(
            body.website_id,
            body.data.session_id,
            body.data.content
          );

          await handleQuery(
            body.website_id,
            body.data.session_id,
            body.data.content
          );
          break;
        }
      }

      break;
    case 'message:updated':
      if (
        body.data.content.id?.startsWith?.('databerry-query') &&
        body.data.content.value
      ) {
        // x-delivery-attempt-count

        await handleQuery(
          body.website_id,
          body.data.session_id,
          body.data.content.value
        );
      }

      break;
    default:
      break;
  }

  res.status(200).json({
    hello: 'world',
  });

  return;
};

handler.post(
  validate({
    // body: SearchManyRequestSchema,
    // handler: respond(hook),
    handler: hook,
  })
);

export default handler;
