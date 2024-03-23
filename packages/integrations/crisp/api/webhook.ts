import Crisp from 'crisp-api';
import cuid from 'cuid';
import { TFunction } from 'i18next';
import { NextApiResponse } from 'next';

import ConversationManager from '@chaindesk/lib/conversation';
import { createApiHandler } from '@chaindesk/lib/createa-api-handler';
import filterInternalSources from '@chaindesk/lib/filter-internal-sources';
import formatSourcesRawText from '@chaindesk/lib/form-sources-raw-text';
import handleChatMessage, {
  ChatAgentArgs,
  ChatConversationArgs,
} from '@chaindesk/lib/handle-chat-message';
import i18n from '@chaindesk/lib/locales/i18next';
import {
  Action,
  AIStatus,
  ConversationMetadata,
} from '@chaindesk/lib/types/crisp';
import { AppNextApiRequest } from '@chaindesk/lib/types/index';
import {
  ConversationChannel,
  ConversationStatus,
  MessageFrom,
  ServiceProviderType,
  SubscriptionPlan,
} from '@chaindesk/prisma';
import { prisma } from '@chaindesk/prisma/client';
import getRequestLocation from '@chaindesk/lib/get-request-location';
import axios from 'axios';

const isCrispAction = (type: string): type is Action =>
  (Object.values(Action) as string[]).includes(type);

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
  | 'message:acknowledge:delivered'
  | 'session:set_data';

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

type HookBodySetData = HookBodyBase & {
  event: Extract<HookEventType, 'session:set_data'>;
  data: {
    session_id: string;
    website_id: string;
    data: {
      aiStatus: string;
      aiDisabledDate: string;
    };
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

const getIntegration = async (websiteId: string, channelExternalId: string) => {
  const integration = await prisma.serviceProvider.findUniqueOrThrow({
    where: {
      unique_external_id: {
        type: ServiceProviderType.crisp,
        externalId: websiteId,
      },
    },
    include: {
      conversations: {
        ...ChatConversationArgs,
        where: {
          channelExternalId,
        },
        take: 1,
      },
      agents: {
        ...ChatAgentArgs,
        take: 1,
      },
    },
  });

  let agent = integration?.agents?.[0];

  if (!agent) {
    throw new Error('Agent not found');
  }

  const crispActions = (agent.tools || []).map((each) => {
    if (isCrispAction(each.type)) {
      return Action[each.type];
    }
  });

  // For now those tools implemented in the integration (legacy)
  agent.tools = (agent.tools || []).filter((each) => !isCrispAction(each.type));

  return { ...integration, crispActions };
};

const handleQuery = async ({
  websiteId,
  sessionId,
  query,
  t,
  location,
}: {
  websiteId: string;
  sessionId: string;
  query: string;
  t: TFunction<'translation', undefined>;
  location?: ReturnType<typeof getRequestLocation>;
}) => {
  const integration = await getIntegration(websiteId, sessionId);
  const agent = integration?.agents?.[0];

  const chatResponse = await handleChatMessage({
    channel: ConversationChannel.crisp,
    query,
    agent: agent!,
    conversation: integration?.conversations?.[0]!,
    externalVisitorId: sessionId,
    channelExternalId: sessionId,
    channelCredentialsId: integration?.id,
    location,
  });

  if (chatResponse?.agentResponse) {
    const { answer, sources } = chatResponse?.agentResponse;

    const finalAnswer = `${answer}\n\n${formatSourcesRawText(
      !!agent?.includeSources ? filterInternalSources(sources || [])! : []
    )}`.trim();

    const choices = [
      ...(integration?.crispActions.includes(Action.mark_as_resolved)
        ? [
            {
              value: Action.mark_as_resolved,
              icon: '✅',
              label: t('crisp:choices.resolve'),
              selected: false,
            },
          ]
        : []),
      ...(integration?.crispActions.includes(Action.request_human)
        ? [
            {
              value: Action.request_human,
              icon: '💬',
              label: t('crisp:choices.request'),
              selected: false,
            },
          ]
        : []),
    ];

    await CrispClient.website.sendMessageInConversation(websiteId, sessionId, {
      type: choices.length === 0 ? 'text' : 'picker',
      from: 'operator',
      origin: 'chat',

      content:
        choices.length === 0
          ? finalAnswer
          : {
              id: 'chaindesk-answer',
              text: finalAnswer,
              choices,
            },
      user: {
        type: 'participant',
        nickname: agent?.name || 'Chaindesk',
        avatar: agent?.iconUrl || 'https://chaindesk.ai/logo.png',
      },
    });
  }
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
      console.log(
        'x-delivery-attempt-count abort',
        req.headers['x-delivery-attempt-count']
      );
      return "Not the first attempt, don't handle.";
    }

    const metas = await CrispClient.website.getConversationMetas(
      body.website_id,
      body.data.session_id
    );

    const visitorLanguage = metas?.device?.locales?.[0] || 'en';

    // TODO: Find a better way to handle i18n concurrency
    const i18nClone = i18n.cloneInstance();
    const t = await i18nClone.changeLanguage(visitorLanguage); // fall back on english if not supported

    const metadata = metas?.data as ConversationMetadata;

    switch (body.event) {
      case 'message:send':
        if (
          body.data.origin === 'chat' &&
          body.data.from === 'user' &&
          body.data.type === 'text'
        ) {
          if (metadata?.aiStatus === AIStatus.disabled) {
            const integration = await getIntegration(
              body.website_id,
              body.data.session_id
            );

            const conversationManager = new ConversationManager({
              channel: ConversationChannel.crisp as ConversationChannel,
              organizationId: integration?.organizationId as string,
              conversationId: integration?.conversations?.[0]?.id,
              location: getRequestLocation(req),
            });

            await conversationManager.createMessage({
              from: MessageFrom.human,
              text: body.data.content,
              externalVisitorId: body.data.visitorId,
            });

            return 'Message saved';
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
            await handleQuery({
              websiteId: body.website_id,
              sessionId: body.data.session_id,
              query: body.data.content,
              t,
              location: getRequestLocation(req),
            });
          } catch (err) {
            req.logger.error(err);
          }
        }

        break;
      case 'message:received':
        break;
      case 'message:updated':
        req.logger.info(body.data.content?.choices);
        const choices = body.data.content
          ?.choices as HookBodyMessageUpdated['data']['content']['choices'];
        const selected = choices?.find((one) => one.selected);
        const integration = await getIntegration(
          body.website_id,
          body.data.session_id
        );
        switch (selected?.value) {
          case Action.request_human: {
            const requestHumanInternalCall = axios.patch(
              `${process.env.NEXT_PUBLIC_DASHBOARD_URL}/api/conversations/${integration?.conversations?.[0]?.id}`,
              {
                status: ConversationStatus.HUMAN_REQUESTED,
              }
            );

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

              const crispCalls = [
                CrispClient.website.updateConversationMetas(
                  body.website_id,
                  body.data.session_id,
                  {
                    data: {
                      ...metadata,
                      aiStatus: AIStatus.disabled,
                      aiDisabledDate: new Date(),
                    } as ConversationMetadata,
                  }
                ),
                CrispClient.website.sendMessageInConversation(
                  body.website_id,
                  body.data.session_id,
                  {
                    type: 'picker',
                    from: 'operator',
                    origin: 'chat',
                    content: {
                      id: 'chaindesk-enable',
                      text: t('crisp:instructions.callback'),
                      choices: [
                        {
                          value: Action.enable_ai,
                          icon: '▶️',
                          label: t('crisp:choices.enableAi'),
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
                ),
              ];

              await Promise.all([requestHumanInternalCall, ...crispCalls]);
            } else {
              // website offline
              const crispCalls = [
                CrispClient.website.updateConversationMetas(
                  body.website_id,
                  body.data.session_id,
                  {
                    data: {
                      ...metadata,
                      aiStatus: AIStatus.disabled,
                    } as ConversationMetadata,
                  }
                ),
                CrispClient.website.sendMessageInConversation(
                  body.website_id,
                  body.data.session_id,
                  {
                    type: 'picker',
                    from: 'operator',
                    origin: 'chat',

                    content: {
                      id: 'chaindesk-answer',
                      text: t('crisp:instructions.unavailable'),
                      choices: [
                        {
                          value: Action.enable_ai,
                          icon: '▶️',
                          label: t('crisp:choices.enableAi'),
                          selected: false,
                        },
                      ],
                    },
                  }
                ),
              ];

              await Promise.all([requestHumanInternalCall, ...crispCalls]);
            }
            break;
          }
          case Action.mark_as_resolved: {
            const intrernalCall = axios.patch(
              `${process.env.NEXT_PUBLIC_DASHBOARD_URL}/api/conversations/${integration?.conversations?.[0]?.id}`,
              {
                status: ConversationStatus.RESOLVED,
              }
            );
            const crispCall = CrispClient.website.changeConversationState(
              body.website_id,
              body.data.session_id,
              'resolved'
            );

            await Promise.all([intrernalCall, crispCall]);
            break;
          }
          case Action.enable_ai: {
            await CrispClient.website.updateConversationMetas(
              body.website_id,
              body.data.session_id,
              {
                data: {
                  ...metadata,
                  aiStatus: AIStatus.enabled,
                },
              }
            );
            break;
          }
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

handler.post(hook);

export default handler;
