import { Box } from '@mui/joy';

import ChatBox, { ChatBoxBaseProps } from './ChatBox';
import ConversationList from './ConversationList';

interface baseProps extends ChatBoxBaseProps {
  agentId?: string;
  currentConversationId: string;
  handleSelectConversation(conversationId: string): void;
  handleCreateNewChat(): void;
}

type Props = baseProps &
  (
    | {
        readOnly?: false | boolean;
        onSubmit: (message: string, attachments?: File[]) => Promise<any>;
      }
    | { readOnly: true; onSubmit?: never }
  );

function ChatSection({
  agentId,
  currentConversationId,
  handleSelectConversation,
  handleCreateNewChat,
  ...chatboxProps
}: Props) {
  return (
    <>
      <Box
        sx={(theme) => ({
          [theme.breakpoints.down('sm')]: {
            display: 'none',
          },
        })}
      >
        <ConversationList
          agentId={agentId}
          rootSx={{
            pt: 1,
            height: '100%',
            width: '200px',
          }}
          currentConversationId={currentConversationId}
          handleSelectConversation={handleSelectConversation}
          handleCreateNewChat={handleCreateNewChat}
        />
      </Box>

      <Box
        sx={{
          width: '100%',
          height: '100%',
          pb: 2,
        }}
      >
        <ChatBox {...chatboxProps} />
      </Box>
    </>
  );
}

export default ChatSection;
