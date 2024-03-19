import { HelpRequest, render } from '@chaindesk/emails';
import mailer from '@chaindesk/lib/mailer';
import { AppEventType } from '@chaindesk/lib/types';
import { AppEventSchema } from '@chaindesk/lib/types/dtos';
import {
  Agent,
  Conversation,
  Message,
  ServiceProvider,
} from '@chaindesk/prisma';

type AppEventHandler<T extends AppEventSchema> = (event: T) => Promise<void>;

const handler: AppEventHandler<
  Extract<AppEventSchema, { type: 'human-requested' }>
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
    to: event.adminEmail!,
    subject: `❓ Assistance requested from Agent ${agent?.name || ''}`,
    html: render(
      <HelpRequest
        visitorEmail={event?.customerEmail}
        agentName={agent?.name}
        messages={messages}
        ctaLink={`${
          process.env.NEXT_PUBLIC_DASHBOARD_URL
        }/logs?tab=human_requested&targetConversationId=${encodeURIComponent(
          conversation?.id || ''
        )}&targetOrgId=${encodeURIComponent(agent?.organizationId!)}`}
      />
    ),
  });

  // await IntegrationsEventDispatcher.dispatch(
  //   [...((agent?.serviceProviders || []) as ServiceProvider[])],
  //   {
  //     type: AppEventType.HUMAN_REQUESTED,
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
