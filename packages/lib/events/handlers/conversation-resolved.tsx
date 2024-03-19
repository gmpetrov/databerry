import cuid from 'cuid';

import { ConversationResolved, render } from '@chaindesk/emails';
import mailer from '@chaindesk/lib/mailer';
import { AppEventType } from '@chaindesk/lib/types';
import { AppEventSchema, FormConfigSchema } from '@chaindesk/lib/types/dtos';
import {
  Agent,
  Conversation,
  Message,
  ServiceProvider,
} from '@chaindesk/prisma';

type AppEventHandler<T extends AppEventSchema> = (event: T) => Promise<void>;

const handler: AppEventHandler<
  Extract<AppEventSchema, { type: 'conversation-resolved' }>
> = async function (event) {
  const agent = event.agent as Agent & {
    serviceProviders: ServiceProvider[];
  };
  const conversation = event.conversation as Conversation;
  const messages = event.messages as Message[];

  await mailer.sendMail({
    from: {
      name: 'Chaindesk',
      address: process.env.EMAIL_FROM!,
    },
    to: event?.adminEmail,
    subject: `✅ Conversation resolved automatically by ${agent?.name || ''}`,
    html: render(
      <ConversationResolved
        agentName={agent?.name}
        messages={messages}
        ctaLink={`${
          process.env.NEXT_PUBLIC_DASHBOARD_URL
        }/logs?tab=all&targetConversationId=${encodeURIComponent(
          conversation?.id || ''
        )}&targetOrgId=${encodeURIComponent(agent.organizationId!)}`}
      />
    ),
  });

  // await IntegrationsEventDispatcher.dispatch(
  //   [...((agent?.serviceProviders || []) as ServiceProvider[])],
  //   {
  //     type: AppEventType.MARKED_AS_RESOLVED,
  //     payload: {
  //       agent: agent as Agent,
  //       conversation: conversation as Conversation,
  //       messages: messages,
  //       visitorEmail: event.customerEmail!,
  //     },
  //   }
  // );
};

export default handler;
