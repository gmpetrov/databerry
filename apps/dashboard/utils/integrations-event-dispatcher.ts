import { AppEvent, AppEventType } from '@chaindesk/lib/types';
import {
  Conversation,
  Message,
  ServiceProvider,
  ServiceProviderType,
} from '@chaindesk/prisma';

const eventHandlersMap = {
  [AppEventType.HUMAN_REQUESTED]: {
    [ServiceProviderType.zendesk]: import(
      '@chaindesk/integrations/zendesk/lib/events'
    ).then((m) => m.handleHumanRequested),
  },
  [AppEventType.MARKED_AS_RESOLVED]: {
    [ServiceProviderType.zendesk]: import(
      '@chaindesk/integrations/zendesk/lib/events'
    ).then((m) => m.handleMarkedAsResolved),
  },
} as Record<Partial<AppEventType>, Record<Partial<ServiceProviderType>, any>>;

export default class EventDispatcher {
  static async dispatch(
    integrations: ServiceProvider[],
    event: {
      type: AppEvent['type'];
      payload: Omit<AppEvent['payload'], 'credentials'>;
    }
  ) {
    try {
      const promises = [];
      for (const integration of integrations) {
        const handler = await eventHandlersMap?.[event.type]?.[
          integration.type
        ];
        if (typeof handler === 'function') {
          promises.push(
            handler({
              ...event.payload,
              credentials: integration,
            })
          );
        }
      }
      return Promise.all(promises);
    } catch (err) {
      console.log('IntegrationsEventDispatcher error', err);
    }
  }
}
