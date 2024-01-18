import Box from '@mui/joy/Box';
import CircularProgress from '@mui/joy/CircularProgress';
import { useColorScheme } from '@mui/joy/styles';
import { useRouter } from 'next/router';
import React, { useEffect, useMemo } from 'react';

import ChatBox from '@app/components/ChatBox';
import useChat, { ChatContext } from '@app/hooks/useChat';

import pickColorBasedOnBgColor from '@chaindesk/lib/pick-color-based-on-bgcolor';
import { AgentInterfaceConfig } from '@chaindesk/lib/types/models';
import { Agent, ConversationChannel } from '@chaindesk/prisma';

import CustomerSupportActions from './CustomerSupportActions';
import NewChatButton from './NewChatButton';

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

  const methods = useChat({
    endpoint: `${API_URL}/api/agents/${router.query?.agentId}/query`,

    channel: ConversationChannel.website,
    agentId,
    localStorageConversationIdKey: `iFrameConversationId-${router.query?.agentId}`,
  });

  const {
    history,
    isLoadingConversation,
    hasMoreMessages,
    handleAbort,
    handleChatSubmit,
    handleLoadMoreMessages,
    handleEvalAnswer,
  } = methods;

  const primaryColor =
    (router?.query?.primaryColor as string) || config.primaryColor || '#ffffff';

  const textColor = useMemo(() => {
    return pickColorBasedOnBgColor(primaryColor, '#ffffff', '#000000');
  }, [primaryColor]);

  const isPremium = !!(agent as any)?.organization?.subscriptions?.[0]?.id;

  // TODO: find why onSuccess is not working
  // useSWR<Agent>(`${API_URL}/api/agents/${agentId}`, fetcher, {
  //   onSuccess: (data) => {
  //     const agentConfig = data?.interfaceConfig as AgentInterfaceConfig;

  //     setAgent(data);
  //     setConfig({
  //       ...defaultChatBubbleConfig,
  //       ...agentConfig,
  //     });
  //   },
  //   onError: (err) => {
  //     console.error(err);
  //   },
  // });

  const handleFetchAgent = async () => {
    try {
      const res = await fetch(`${API_URL}/api/agents/${agentId}`);
      const data = (await res.json()) as Agent;

      const agentConfig = data?.interfaceConfig as AgentInterfaceConfig;

      setAgent(data);
      setConfig({
        ...defaultChatBubbleConfig,
        ...agentConfig,
      });
    } catch (err) {
      console.error(err);
    } finally {
    }
  };

  useEffect(() => {
    if (agentId) {
      handleFetchAgent();
    }
  }, [agentId]);

  useEffect(() => {
    if (props.initConfig) {
      setConfig(props.initConfig);
    }
  }, [props.initConfig]);

  if (!agent) {
    return (
      <Box
        sx={{
          width: '100dvw',
          height: '100dvh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          background: 'transparent',
        }}
      >
        <CircularProgress size="sm" variant="soft" color="neutral" />
      </Box>
    );
  }

  return (
    <ChatContext.Provider
      value={{
        ...methods,
      }}
    >
      <Box
        className="chaindesk-iframe"
        sx={(theme) => ({
          px: 2,
          pb: 2,
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
        <NewChatButton
          sx={{
            position: 'absolute',
            right: 15,
            top: 15,
            background: 'white',
            zIndex: 1,
          }}
        />
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
          hideInternalSources
          renderBottom={<CustomerSupportActions config={config} />}
          withFileUpload
          withSources={!!agent?.includeSources}
          isAiEnabled={methods.isAiEnabled}
          disableWatermark={isPremium && !!config?.isBrandingDisabled}
        />
      </Box>
    </ChatContext.Provider>
  );
}

export default ChatBoxFrame;
