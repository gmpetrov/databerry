import {
  ConversationChannel,
  MessageFrom,
  SubscriptionPlan,
} from "@prisma/client";
import Crisp from "crisp-api";
import cuid from "cuid";
import { NextApiResponse } from "next";

import { AppNextApiRequest } from "@app/types/index";
import AgentManager from "@app/utils/agent";
import ConversationManager from "@app/utils/conversation";
import { createApiHandler } from "@app/utils/createa-api-handler";
import getSubdomain from "@app/utils/get-subdomain";
import guardAgentQueryUsage from "@app/utils/guard-agent-query-usage";
import prisma from "@app/utils/prisma-client";
import validate from "@app/utils/validate";


const handler = createApiHandler();

const CrispClient = new Crisp();

CrispClient.authenticateTier(
  "plugin",
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

type HookDataType = "text";

type HookFrom = "user" | "operator";

type HookBodyBase = {
  website_id: string;
  event: HookEventType;
  timestamp: number;
  data: {
    [key: string]: any;
  };
};

type HookBodyMessageSent = HookBodyBase & {
  event: Extract<HookEventType, "message:send">;
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
  event: Extract<HookEventType, "message:updated">;
  data: {
    content: {
      id: string;
      text: string;
      explain: string;
      value?: string;
      choices?: {

        value: 'resolved' | 'request_human' | 'enable_ai';
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
    throw new Error("Datastore not found");
  }

  return agent;
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
    return;
  }

  const conversation = await prisma.conversation.findFirst({
    where: {
      AND: [{ agentId: agent?.id }, { visitorId: sessionId }],
    },
  });

  const conversationId = conversation?.id || cuid();

  const conversationManager = new ConversationManager({
    channel: ConversationChannel.crisp,
    agentId: agent?.id!,
    visitorId: sessionId,
    conversationId,
  });

  conversationManager.push({
    from: MessageFrom.human,
    text: query,
  });

  const answer = await new AgentManager({ agent }).query({
    input: query,
  });

  await CrispClient.website.sendMessageInConversation(websiteId, sessionId, {
    type: "picker",
    from: "operator",
    origin: "chat",

    content: {
      id: "databerry-answer",
      text: answer,
      choices: [
        {
          value: "resolved",
          icon: "✅",
          label: "Mark as resolved",
          selected: false,
        },
        {
          value: "request_human",
          icon: "💬",
          label: "Request a human operator",
          selected: false,
        },
      ],
    },
    user: {
      type: 'participant',
      nickname: agent?.name || 'GriotAI',
      avatar:
        agent.iconUrl || "https://griotai.kasetolabs.xyz/databerry-rounded-bg-white.png",
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
    res.status(200).send("Handling...");
    const host = req?.headers?.["host"];
    const subdomain = getSubdomain(host!);
    body = req.body as HookBody;

    console.log("BODY", body);

    const _timestamp = req.headers["x-crisp-request-timestamp"];
    const _signature = req.headers["x-crisp-signature"];

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
      return "Not the first attempt, don't handle.";
    }

    const metadata = (
      await CrispClient.website.getConversationMetas(
        body.website_id,
        body.data.session_id
      )
    )?.data;


    const newChoice = body?.data?.content?.choices?.find(
      (one: any) => one.selected
    );

    if (
      metadata?.choice === 'request_human' &&
      newChoice?.value !== 'enable_ai'
    ) {
      return 'User has requested a human operator, do not handle.';
    }

    switch (body.event) {
      case "message:send":
        if (
          // body.data.origin === 'chat' &&
          body.data.from === 'user' &&
          body.data.type === 'text' &&
          metadata?.choice !== 'request_human'
        ) {
          CrispClient.website.composeMessageInConversation(
            body.website_id,
            body.data.session_id,
            {
              type: 'start',
              from: 'operator',
            }
          );

          await handleQuery(
            body.website_id,
            body.data.session_id,
            body.data.content
          );
        }

        break;
      case 'message:received':
        if (
          body.data.from === 'operator' &&
          body.data.type === 'text' &&
          metadata?.choice !== 'request_human'
        ) {
          await CrispClient.website.updateConversationMetas(
            body.website_id,
            body.data.session_id,
            {
              data: {
                choice: 'request_human',
              },
            }
          );
        }
        break;
      case 'message:updated':
        console.log(body.data.content?.choices);
        const choices = body.data.content
          ?.choices as HookBodyMessageUpdated["data"]["content"]["choices"];
        const selected = choices?.find((one) => one.selected);

        switch (selected?.value) {
          case "request_human":
            await CrispClient.website.updateConversationMetas(
              body.website_id,
              body.data.session_id,
              {
                data: {
                  choice: "request_human",
                },
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
                  id: 'databerry-enable',
                  text: 'An operator will get back to you shortly.',
                  choices: [
                    {
                      value: 'enable_ai',
                      icon: '▶️',
                      label: 'Re-enable AI',
                      selected: false,
                    },
                  ],
                },
              }
            );

            break;
          case "resolved":
            await CrispClient.website.changeConversationState(
              body.website_id,
              body.data.session_id,
              "resolved"
            );
            break;
          case 'enable_ai':
            await CrispClient.website.updateConversationMetas(
              body.website_id,
              body.data.session_id,
              {
                data: {
                  choice: 'enable_ai',
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
    console.log("ERROR", err);
  } finally {
    return 'Success';
  }
};

handler.post(
  hook
);

export default handler;
