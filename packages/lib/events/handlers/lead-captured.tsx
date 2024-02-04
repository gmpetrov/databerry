import { HelpRequest, NewLead, render } from '@chaindesk/emails';
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
  Extract<AppEventSchema, { type: 'lead-captured' }>
> = async function (event) {
  const agent = event.agent as Agent & {
    serviceProviders: ServiceProvider[];
  };
  const conversation = event.conversation as Conversation;
  const messages = event.messages as Message[];

  await Promise.all([
    mailer.sendMail({
      from: {
        name: 'Chaindesk',
        address: process.env.EMAIL_FROM!,
      },
      to: event.adminEmail!,
      subject: `🎯 New lead captured by Agent ${agent?.name || ''}`,
      html: render(
        <NewLead
          visitorEmail={event.customerEmail}
          agentName={agent.name}
          messages={messages}
          ctaLink={`${
            process.env.NEXT_PUBLIC_DASHBOARD_URL
          }/logs?tab=all&targetConversationId=${encodeURIComponent(
            conversation?.id
          )}&targetOrgId=${encodeURIComponent(agent.organizationId!)}`}
        />
      ),
    }),
  ]);
};

export default handler;
