import { CustomContact } from '@app/components/ChatBubble';

export interface ChaindeskFactory {
  initChatBubble: (props: {
    agentId: string;
    onMarkedAsResolved?(): any;
    contact?: CustomContact;
  }) => void;
}
