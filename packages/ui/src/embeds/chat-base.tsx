import { AgentInterfaceConfig } from '@chaindesk/lib/types/models';
import pickColorBasedOnBgColor from '@chaindesk/lib/pick-color-based-on-bgcolor';
import React, { useMemo } from 'react';
import { cn } from '../utils/cn';
import { useColorScheme } from '@mui/joy/styles';
import Box from '@mui/joy/Box';
import ChatBox, { ChatBoxProps } from '../Chatbox';
import { SxProps } from '@mui/joy/styles/types';
import { Agent } from '@chaindesk/prisma';
import CircularProgress from '@mui/joy/CircularProgress';

export type ChatBaseProps = {
  agentId?: string;
  agentIconUrl?: string;
  layout?: any;
  interfaceConfig?: AgentInterfaceConfig;
  layoutClassName?: string;
  containerSxProps?: SxProps;
  chatBoxProps: ChatBoxProps;
  isLoadingAgent?: boolean;
};

function Standard({
  agentId,
  layout,
  interfaceConfig,
  layoutClassName,
  containerSxProps,
  chatBoxProps,
  isLoadingAgent,
  agentIconUrl,
}: ChatBaseProps) {
  const { mode } = useColorScheme();

  const Layout = layout || React.Fragment;
  const primaryColor = interfaceConfig?.primaryColor || '#ffffff';

  const textColor = useMemo(() => {
    return pickColorBasedOnBgColor(primaryColor, '#ffffff', '#000000');
  }, [primaryColor]);

  if (isLoadingAgent) {
    return (
      <Box
        sx={{
          width: '100%',
          height: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          background: 'transparent',
          ...(containerSxProps ? containerSxProps : {}),
        }}
      >
        <CircularProgress size="sm" variant="soft" color="neutral" />
      </Box>
    );
  }

  return (
    <Layout
      {...(layout
        ? {
            className: cn(mode, layoutClassName),
            agentId: agentId,
            config: interfaceConfig,
            agentIconUrl,
          }
        : {})}
    >
      <Box
        className={cn({
          [`${mode} ${layoutClassName}`]: !layout,
        })}
        sx={(theme) => ({
          display: 'flex',
          flex: 1,
          flexDirection: 'column',
          position: 'relative',
          width: '100%',
          height: '100%',
          overflow: 'hidden',
          maxHeight: '100%',
          boxSizing: 'border-box',
          backgroundColor: interfaceConfig?.isBgTransparent
            ? 'transparent'
            : theme.palette.background.default,

          '& .message-agent': {},
          '& .message-human': {
            backgroundColor: primaryColor,
          },
          '& .message-human *': {
            color: textColor,
          },

          ...((containerSxProps ? containerSxProps : {}) as any),
        })}
      >
        <ChatBox
          {...chatBoxProps}
          {...(agentIconUrl ? { agentIconUrl } : {})}
        />
      </Box>
    </Layout>
  );
}

export default Standard;
