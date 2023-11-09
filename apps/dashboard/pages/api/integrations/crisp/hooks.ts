import Crisp from 'crisp-api';
import cuid from 'cuid';
import { NextApiResponse } from 'next';

import i18n from '@app/locales/i18next';

import AgentManager from '@chaindesk/lib/agent';
import ConversationManager from '@chaindesk/lib/conversation';
import { createApiHandler } from '@chaindesk/lib/createa-api-handler';
import filterInternalSources from '@chaindesk/lib/filter-internal-sources';
import formatSourcesRawText from '@chaindesk/lib/form-sources-raw-text';
import getSubdomain from '@chaindesk/lib/get-subdomain';
import guardAgentQueryUsage from '@chaindesk/lib/guard-agent-query-usage';
import {
  Action,
  AIStatus,
  ConversationMetadata,
} from '@chaindesk/lib/types/crisp';
import { AppNextApiRequest } from '@chaindesk/lib/types/index';
import validate from '@chaindesk/lib/validate';
import {
  ConversationChannel,
  MessageFrom,
  SubscriptionPlan,
} from '@chaindesk/prisma';
import { prisma } from '@chaindesk/prisma/client';

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
  | 'message:received'
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
    visitorId: number;
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
      choices?: {
        value: Action;
        icon: string;
        label: string;
        selected: boolean;
      }[];
    };
    visitorId: number;
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
          organization: {
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

// const handleSendInput = async ({
//   websiteId,
//   sessionId,
//   value,
//   agentName,
// }: {
//   websiteId: string;
//   sessionId: string;
//   value?: string;
//   agentName?: string;
// }) => {
//   await CrispClient.website.sendMessageInConversation(websiteId, sessionId, {
//     type: 'field',
//     from: 'operator',
//     origin: 'chat',
//     user: {
//       type: 'participant',
//       nickname: agentName || 'Chaindesk',
//       avatar: 'https://chaindesk.ai/app-rounded-bg-white.png',
//     },

//     content: {
//       id: `chaindesk-query-${cuid()}`,
//       text: `✨ Ask ${agentName || `Chaindesk`}`,
//       explain: 'Query',
//       value,
//     },
//   });
// };

const handleQuery = async (
  websiteId: string,
  sessionId: string,
  query: string
) => {
  const agent = await getAgent(websiteId);

  const usage = agent?.organization?.usage!;
  const plan =
    agent?.organization?.subscriptions?.[0]?.plan || SubscriptionPlan.level_0;

  try {
    guardAgentQueryUsage({
      usage,
      plan,
    });
  } catch {
    return;
    // return await CrispClient.website.sendMessageInConversation(
    //   websiteId,
    //   sessionId,
    //   {
    //     type: 'text',
    //     from: 'operator',
    //     origin: 'chat',
    //     content: 'Usage limit reached.',
    //     user: {
    //       type: 'participant',
    //       nickname: agent?.name || 'Chaindesk',
    //       avatar:
    //         agent.iconUrl ||
    //         'https://chaindesk.ai/app-rounded-bg-white.png',
    //     },
    //   }
    // );
  }

  const conversation = await prisma.conversation.findFirst({
    where: {
      AND: [{ agentId: agent?.id }, { visitorId: sessionId }],
    },
    include: {
      messages: {
        take: -4,
        orderBy: {
          createdAt: 'asc',
        },
      },
    },
  });

  const conversationId = conversation?.id || cuid();

  const conversationManager = new ConversationManager({
    organizationId: agent?.organizationId!,
    channel: ConversationChannel.crisp,
    agentId: agent?.id!,
    visitorId: sessionId,
    conversationId,
  });

  conversationManager.push({
    from: MessageFrom.human,
    text: query,
  });

  const { answer, sources } = await new AgentManager({ agent }).query({
    input: query,
    history: conversation?.messages,
  });

  const finalAnswer = `${answer}\n\n${formatSourcesRawText(
    filterInternalSources(sources)!
  )}`.trim();

  CrispClient.website.visitorId;

  await CrispClient.website.sendMessageInConversation(websiteId, sessionId, {
    type: 'picker',
    from: 'operator',
    origin: 'chat',

    content: {
      id: 'chaindesk-answer',
      text: finalAnswer,
      choices: [
        {
          value: Action.mark_as_resolved,
          icon: '✅',
          label: i18n.t('crisp:choices.resolve'),
          selected: false,
        },
        {
          value: Action.request_human,
          icon: '💬',
          label: i18n.t('crisp:choices.request'),
          selected: false,
        },
      ],
    },
    user: {
      type: 'participant',
      nickname: agent?.name || 'Chaindesk',
      avatar: agent.iconUrl || 'https://chaindesk.ai/app-rounded-bg-white.png',
    },
  });

  conversationManager.push({
    from: MessageFrom.agent,
    text: answer,
  });

  conversationManager.save();
};

export const hook = async (req: AppNextApiRequest, res: NextApiResponse) => {
  let body = {} as HookBody;

  try {
    res.status(200).send('Handling...');
    // const host = req?.headers?.['host'];
    // const subdomain = getSubdomain(host!);
    body = req.body as HookBody;
    req.logger.info(body);

    const _timestamp = req.headers['x-crisp-request-timestamp'];
    const _signature = req.headers['x-crisp-signature'];

    // const verified = CrispClient.verifyHook(
    //   process.env.CRISP_HOOK_SECRET!,
    //   body,
    //   _timestamp as any,
    //   _signature as any
    // );

    // if (!verified) {
    // TODO
    // ATM verifyHook() always returns false 🤔
    // }

    if (req.headers['x-delivery-attempt-count'] !== '1') {
      console.log('x-delivery-attempt-count abort');
      return "Not the first attempt, don't handle.";
    }

    const metas = await CrispClient.website.getConversationMetas(
      body.website_id,
      body.data.session_id
    );

    const visitorLanguage = metas.device.locales[0];

    i18n.changeLanguage(visitorLanguage); // fall back on english if not supported

    const metadata = metas?.data as ConversationMetadata;
    // const newChoice = body?.data?.content?.choices?.find(
    //   (one: any) => one.selected
    // );

    switch (body.event) {
      case 'message:send':
        if (
          body.data.origin === 'chat' &&
          body.data.from === 'user' &&
          body.data.type === 'text'
        ) {
          if (metadata?.aiStatus === AIStatus.disabled) {
            // const oneHourAgo = new Date().getTime() - 10 * 1000;

            // if (new Date(metadata?.aiDisabledDate!).getTime() < oneHourAgo) {
            //   console.log('CALLLED ----------------', 'ENABLED AI');
            //   await CrispClient.website.updateConversationMetas(
            //     body.website_id,
            //     body.data.session_id,
            //     {
            //       data: {
            //         aiStatus: AIStatus.enabled,
            //       } as ConversationMetadata,
            //     }
            //   );
            // } else {
            //   return 'Converstaion disabled dot not proceed';
            // }
            return 'Converstaion disabled dot not proceed';
          }

          CrispClient.website.composeMessageInConversation(
            body.website_id,
            body.data.session_id,
            {
              type: 'start',
              from: 'operator',
            }
          );

          try {
            await handleQuery(
              body.website_id,
              body.data.session_id,
              body.data.content
            );
          } catch (err) {
            req.logger.error(err);
          }
        }

        break;
      case 'message:received':
        if (body.data.from === 'operator' && body.data.type === 'text') {
          await CrispClient.website.updateConversationMetas(
            body.website_id,
            body.data.session_id,
            {
              data: {
                aiStatus: AIStatus.disabled,
                aiDisabledDate: new Date(),
              } as ConversationMetadata,
            }
          );
        }
        break;
      case 'message:updated':
        req.logger.info(body.data.content?.choices);
        const choices = body.data.content
          ?.choices as HookBodyMessageUpdated['data']['content']['choices'];
        const selected = choices?.find((one) => one.selected);

        switch (selected?.value) {
          case Action.request_human:
            const availibility =
              await CrispClient.website.getWebsiteAvailabilityStatus(
                body.data.website_id
              );
            const status = availibility?.status;

            if (status === 'online') {
              // Get last active operator
              const active_operators: {
                user_id: string;
                avatar: string | null;
                timestamp: number;
              }[] = await CrispClient.website.listLastActiveWebsiteOperators(
                body.data.website_id
              );

              // const highly_active_operator = active_operators.filter(
              //   (op) =>
              //     op.timestamp ==
              //     Math.min(...active_operators.map((o) => o.timestamp))
              // )[0];

              await CrispClient.website.updateConversationMetas(
                body.website_id,
                body.data.session_id,
                {
                  data: {
                    aiStatus: AIStatus.disabled,
                    aiDisabledDate: new Date(),
                  } as ConversationMetadata,
                }
              );

              await CrispClient.website.sendMessageInConversation(
                body.website_id,
                body.data.session_id,
                {
                  type: 'picker',
                  from: 'operator',
                  origin: 'chat',
                  content: {
                    id: 'chaindesk-enable',
                    text: i18n.t('crisp:instructions.callback'),
                    choices: [
                      {
                        value: Action.enable_ai,
                        icon: '▶️',
                        label: i18n.t('crisp:choices.enableAi'),
                        selected: false,
                      },
                    ],
                  },
                  // mentions: [highly_active_operator.user_id],
                  mentions: active_operators.map((each) => each.user_id),
                  user: {
                    type: 'website',
                    nickname: 'chaindesk',
                  },
                }
              );
            } else {
              // website offline
              await CrispClient.website.updateConversationMetas(
                body.website_id,
                body.data.session_id,
                {
                  data: {
                    aiStatus: AIStatus.disabled,
                  } as ConversationMetadata,
                }
              );

              await CrispClient.website.sendMessageInConversation(
                body.website_id,
                body.data.session_id,
                {
                  type: 'picker',
                  from: 'operator',
                  origin: 'chat',

                  content: {
                    id: 'chaindesk-answer',
                    text: i18n.t('crisp:instructions.unavailable'),
                    choices: [
                      {
                        value: Action.enable_ai,
                        icon: '▶️',
                        label: i18n.t('crisp:choices.enableAi'),
                        selected: false,
                      },
                    ],
                  },
                  // user: {
                  //   type: 'participant',
                  //   nickname: agent?.name || 'Chaindesk',
                  //   avatar: agent.iconUrl || 'https://chaindesk.ai/app-rounded-bg-white.png',
                  // },
                }
              );
            }
            break;
          case Action.mark_as_resolved:
            await CrispClient.website.changeConversationState(
              body.website_id,
              body.data.session_id,
              'resolved'
            );
            break;
          case Action.enable_ai:
            await CrispClient.website.updateConversationMetas(
              body.website_id,
              body.data.session_id,
              {
                data: {
                  aiStatus: AIStatus.enabled,
                },
              }
            );
            break;
          default:
            break;
        }

        break;
      default:
        break;
    }

    CrispClient.website.composeMessageInConversation(
      body.website_id,
      body.data.session_id,
      {
        type: 'stop',
        from: 'operator',
      }
    );
  } catch (err) {
    req.logger.error(err);
  } finally {
    return 'Success';
  }
};

handler.post(
  hook
  // validate({
  // body: SearchManyRequestSchema,
  // handler: respond(hook),
  // handler: hook,
  // })
);

export default handler;
