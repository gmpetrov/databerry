import Box from '@mui/joy/Box';
import { useColorScheme } from '@mui/joy/styles';
import { Agent, ConversationChannel } from '@prisma/client';
import { useRouter } from 'next/router';
import React, { useEffect, useMemo } from 'react';

import ChatBox from '@app/components/ChatBox';
import useAgentChat from '@app/hooks/useAgentChat';
import useVisitorId from '@app/hooks/useVisitorId';
import { AgentInterfaceConfig } from '@app/types/models';
import pickColorBasedOnBgColor from '@app/utils/pick-color-based-on-bgcolor';

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
  const { visitorId } = useVisitorId();

  const { history, handleChatSubmit } = useAgentChat({
    queryAgentURL: `${API_URL}/api/external/agents/${agentId}/query`,
    channel: ConversationChannel.website,
    // queryHistoryURL: visitorId
    //   ? `/api/external/agents/${router.query?.agentId}/history/${visitorId}`
    //   : undefined,
  });

  const textColor = useMemo(() => {
    return pickColorBasedOnBgColor(
      config.primaryColor || '#ffffff',
      '#ffffff',
      '#000000'
    );
  }, [config.primaryColor]);

  const handleFetchAgent = async () => {
    try {
      const res = await fetch(`${API_URL}/api/external/agents/${agentId}`);
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

        '& .message-agent': {
          backgroundColor: config.primaryColor,
          borderColor: config.primaryColor,
          color: textColor,
        },
      })}
    >
      <ChatBox
        messages={history}
        onSubmit={handleChatSubmit}
        messageTemplates={config.messageTemplates}
        initialMessage={config.initialMessage}
      />
    </Box>
  );
}

export default ChatBoxFrame;
