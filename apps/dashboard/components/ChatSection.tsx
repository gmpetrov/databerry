import { Box } from '@mui/joy';

import ChatBox, { ChatBoxProps } from '@chaindesk/ui/Chatbox';

import ConversationList from './ConversationList';

interface Props extends ChatBoxProps {
  agentId?: string;
  currentConversationId: string;
  handleSelectConversation(conversationId: string): void;
  handleCreateNewChat(): void;
}

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
            minHeight: '100%',
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
