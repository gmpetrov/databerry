import { CustomContact } from '@app/hooks/useChat';

export interface ChaindeskFactory {
  initBubble: (props: {
    agentId: string;
    onMarkedAsResolved?(): any;
    contact?: CustomContact;
  }) => void;
}
