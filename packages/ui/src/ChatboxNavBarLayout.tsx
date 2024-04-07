import Avatar from '@mui/joy/Avatar';
import Box from '@mui/joy/Box';
import Stack from '@mui/joy/Stack';
import Typography from '@mui/joy/Typography';

import useAgent from '@chaindesk/ui/hooks/useAgent';

const defaultAgentIconUrl = `${process.env.NEXT_PUBLIC_DASHBOARD_URL}/images/chatbubble-default-icon-sm.gif`;

import { AgentInterfaceConfig } from '@chaindesk/lib/types/models';
import NewChatButton from '@chaindesk/ui/Chatbox/NewChatButton';
import DarkModeToggle from '@chaindesk/ui/DarkModeToggle';
import { cn } from '@chaindesk/ui/utils/cn';

const ChatBoxLayout = (props: {
  className?: string;
  children?: any;
  name?: string;
  imageUrl?: string;
  handleClose?: any;
  agentId?: string;
  config?: AgentInterfaceConfig;
}) => {
  const { query } = useAgent({ id: props.agentId });
  return (
    <Box
      // className="relative w-full h-full px-4 pt-16 pb-2"
      className={cn(props.className)}
      sx={{
        position: 'relative',
        px: 2,
        pt: 8,
        pb: 2,
        width: '100%',
        height: '100%',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          with: '100%',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1,
          px: 2,
        }}
      >
        <Stack
          direction="row"
          sx={(t) => ({
            mt: 2,
            px: 2,
            py: 1,
            alignItems: 'center',
            border: '1px solid',
            borderColor: 'divider',
            maxWidth: '700px',
            mx: 'auto',
            background: t.palette.background.surface,
            borderRadius: t.radius.md,
          })}
          // className="border border-transparent [background:linear-gradient(theme(colors.white),theme(colors.white))_padding-box,linear-gradient(120deg,theme(colors.zinc.300),theme(colors.zinc.100),theme(colors.zinc.300))_border-box] rounded-lg"
        >
          <Avatar
            size={'sm'}
            variant="outlined"
            sx={{ mr: 1 }}
            src={query?.data?.iconUrl || defaultAgentIconUrl}
          />
          {/* {state.config?.displayName && ( */}
          <Typography
            level="body-lg"
            sx={(t) => ({
              fontFamily: 'Bricolage Grotesque',
              fontWeight: t.fontWeight.lg,
            })}
          >
            {props?.config?.displayName || query?.data?.name}
            {/* {(query?.data?.interfaceConfig as AgentInterfaceConfig)
              ?.displayName || query?.data?.name} */}
          </Typography>
          {/* )} */}

          <Stack
            direction="row"
            sx={{
              ml: 'auto',
              alignItems: 'center',
            }}
          >
            <NewChatButton variant="plain" />
          </Stack>
          {/* <DarkModeToggle variant="plain" color="neutral" /> */}
        </Stack>
      </Box>
      {props.children}
    </Box>
  );
};

export default ChatBoxLayout;
