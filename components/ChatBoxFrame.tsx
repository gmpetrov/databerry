import Box from '@mui/joy/Box';
import { useColorScheme } from '@mui/joy/styles';
import { Agent, ConversationChannel } from '@prisma/client';
import { useRouter } from 'next/router';
import React, { useEffect, useMemo } from 'react';
import useSWR from 'swr';

import ChatBox from '@app/components/ChatBox';
import useChat from '@app/hooks/useChat';
import useRateLimit from '@app/hooks/useRateLimit';
import { AgentInterfaceConfig } from '@app/types/models';
import pickColorBasedOnBgColor from '@app/utils/pick-color-based-on-bgcolor';
import { fetcher } from '@app/utils/swr-fetcher';

const defaultChatBubbleConfig: AgentInterfaceConfig = {
  // displayName: 'Agent Smith',
  theme: 'light',
  primaryColor: '#000000',
  isBgTransparent: false,
  // initialMessage: 'Hi, how can I help you?',
  // position: 'right',
  // messageTemplates: ["What's the pricing?"],
};

const API_URL = process.env.NEXT_PUBLIC_DASHBOARD_URL;

function ChatBoxFrame(props: { initConfig?: AgentInterfaceConfig }) {
  const router = useRouter();
  const { mode, setMode } = useColorScheme();

  const agentId = router.query.agentId as string;
  const [agent, setAgent] = React.useState<Agent | undefined>();
  const [config, setConfig] = React.useState<AgentInterfaceConfig>(
    props.initConfig || defaultChatBubbleConfig
  );
  const { isRateExceeded, rateExceededMessage } = useRateLimit({
    agentId: `${router.query?.agentId}`,
  });

  const {
    history,
    handleChatSubmit,
    isLoadingConversation,
    hasMoreMessages,
    handleLoadMoreMessages,
    handleEvalAnswer,
    handleAbort,
  } = useChat({
    endpoint: `/api/agents/${router.query?.agentId}/query`,
    channel: ConversationChannel.website,
    isRateExceeded,
    rateExceededMessage,
  });

  const primaryColor =
    (router?.query?.primaryColor as string) || config.primaryColor || '#ffffff';

  const textColor = useMemo(() => {
    return pickColorBasedOnBgColor(primaryColor, '#ffffff', '#000000');
  }, [primaryColor]);

  useSWR<Agent>(`${API_URL}/api/agents/${agentId}`, fetcher, {
    onSuccess: (data) => {
      const agentConfig = data?.interfaceConfig as AgentInterfaceConfig;

      setAgent(data);
      setConfig({
        ...defaultChatBubbleConfig,
        ...agentConfig,
      });
    },
    onError: (err) => {
      console.error(err);
    },
  });

  useEffect(() => {
    if (props.initConfig) {
      setConfig(props.initConfig);
    }
  }, [props.initConfig]);

  //   useEffect(() => {
  //     setMode(config.theme!);
  //   }, []);

  if (!agent) {
    return null;
  }

  return (
    <Box
      sx={(theme) => ({
        p: 2,
        position: 'relative',
        width: '100vw',
        height: '100vh',
        maxHeight: '100%',
        boxSizing: 'border-box',
        backgroundColor: config?.isBgTransparent
          ? 'transparent'
          : theme.palette.background.default,

        '& .message-agent': {},
        '& .message-human': {
          backgroundColor: primaryColor,
        },
        '& .message-human *': {
          color: textColor,
        },
      })}
    >
      <ChatBox
        messages={history}
        onSubmit={handleChatSubmit}
        messageTemplates={config.messageTemplates}
        initialMessage={config.initialMessage}
        agentIconUrl={agent?.iconUrl!}
        isLoadingConversation={isLoadingConversation}
        hasMoreMessages={hasMoreMessages}
        handleLoadMoreMessages={handleLoadMoreMessages}
        handleEvalAnswer={handleEvalAnswer}
        handleAbort={handleAbort}
      />
    </Box>
  );
}

export default ChatBoxFrame;
