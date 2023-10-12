import { AppEvent, AppEventType } from '@chaindesk/lib/types';
import { ServiceProviderZendesk } from '@chaindesk/lib/types/dtos';
import getHttpClient from './get-http-client';

export const handleHumanRequested = async (
  data: Extract<AppEvent, { type: AppEventType.HUMAN_REQUESTED }>['payload']
) => {
  const credentialsConfig = data?.credentials
    ?.config as ServiceProviderZendesk['config'];

  const payload = {
    ticket: {
      requester: {
        email: data.visitorEmail,
        name: data.visitorEmail, // Optional, but recommended
      },
      external_id: data?.conversation?.id,
      subject: `❓ Assistance requested from Agent ${data?.agent?.name || ''}`,
      comment: {
        body: JSON.stringify(
          data?.messages?.map((each) => ({
            from: each?.from,
            message: each?.text,
          })),
          null,
          2
        ),
      },
    },
  };

  const client = getHttpClient(credentialsConfig);
  return client.post(`/api/v2/tickets.json`, payload);
};

export const handleMarkedAsResolved = async (
  data: Extract<AppEvent, { type: AppEventType.MARKED_AS_RESOLVED }>['payload']
) => {
  const client = getHttpClient(data?.credentials?.config as any);

  const res = await client.get(
    `/api/v2/tickets?external_id=${data?.conversation?.id}`
  );

  const ticketId = res.data?.tickets?.[0]?.id;
  if (ticketId) {
    await client.put(`/api/v2/tickets/${ticketId}`, {
      ticket: {
        comment: {
          body: 'Automatically resolved by AI Agent',
          public: false,
        },
        status: 'solved',
      },
    });
  } else {
    console.log('No ticket found for conversation', data?.conversation?.id);
  }
};
