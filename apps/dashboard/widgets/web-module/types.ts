export interface ChaindeskFactory {
  initChatBubble: (props: {
    agentId: string;
    onMarkedAsResolved?(): any;
  }) => void;
}
