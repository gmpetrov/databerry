import { CustomContact } from '@chaindesk/lib/types';

export interface ChaindeskFactory {
  initBubble: (props: {
    agentId: string;
    onMarkedAsResolved?(): any;
    contact?: CustomContact;
  }) => void;
}
