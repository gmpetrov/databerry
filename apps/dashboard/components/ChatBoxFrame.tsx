import Avatar from '@mui/joy/Avatar';
import Box from '@mui/joy/Box';
import CircularProgress from '@mui/joy/CircularProgress';
import IconButton from '@mui/joy/IconButton';
import Stack from '@mui/joy/Stack';
import { useColorScheme } from '@mui/joy/styles';
import { SxProps } from '@mui/joy/styles/types';
import Typography from '@mui/joy/Typography';
import React, { ReactPropTypes, useEffect, useMemo } from 'react';
import useSWR from 'swr';

import ChatBox from '@app/components/ChatBox';
import useAgent from '@app/hooks/useAgent';
import useChat, { ChatContext, CustomContact } from '@app/hooks/useChat';
import { getConversation } from '@app/pages/api/conversations/[conversationId]';
import { InitWidgetProps } from '@app/widgets/chatbox/common/types';

import pickColorBasedOnBgColor from '@chaindesk/lib/pick-color-based-on-bgcolor';
import { fetcher } from '@chaindesk/lib/swr-fetcher';
import { ChatMessage } from '@chaindesk/lib/types';
import { LeadCaptureToolchema } from '@chaindesk/lib/types/dtos';
import { AgentInterfaceConfig } from '@chaindesk/lib/types/models';
import {
  Agent,
  ConversationChannel,
  Form,
  Prisma,
  Tool,
} from '@chaindesk/prisma';
import LeadForm from '@chaindesk/ui/LeadForm';
import { cn } from '@chaindesk/ui/utils/cn';

import TraditionalForm from './TraditionalForm';

const defaultAgentIconUrl = `${process.env.NEXT_PUBLIC_DASHBOARD_URL}/images/chatbubble-default-icon-sm.gif`;

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

export type ChatBoxStandardProps = InitWidgetProps & {
  instanceId?: string;
  layout?: any;
};

function ChatBoxFrame(props: ChatBoxStandardProps) {
  const { mode } = useColorScheme();
  const [agentId, setAgentId] = React.useState<string | undefined>(
    props.agentId
  );
  const [agent, setAgent] = React.useState<Agent | undefined>();
  const [config, setConfig] = React.useState<AgentInterfaceConfig>(
    props.initConfig || defaultChatBubbleConfig
  );
  const [hasSubmittedForm, setHasSubmittedForm] = React.useState(false);

  const { query } = useAgent({ id: agentId });

  const methods = useChat({
    endpoint: `${API_URL}/api/agents/${agentId}/query`,
    channel: 'website',
    agentId,
    localStorageConversationIdKey: `iFrameConversationId-${agentId}`,
    contact: props.contact,
    context: props.context,
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

  const primaryColor = config.primaryColor || '#ffffff';

  const textColor = useMemo(() => {
    return pickColorBasedOnBgColor(primaryColor, '#ffffff', '#000000');
  }, [primaryColor]);

  useEffect(() => {
    if (props.initConfig) {
      setConfig(props.initConfig);
    }
  }, [props.initConfig]);

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

  useEffect(() => {
    if (typeof window === 'undefined' || !!agentId) {
      return;
    }

    try {
      // Can't use useRouter outside of Next.js (widget context)
      const id = window?.location?.href?.match?.(/agents\/([a-zA-Z0-9]+)/)?.[1];

      if (id) {
        setAgentId(id);
      }
    } catch (e) {
      console.error(e);
    }
  }, [agentId]);

  useEffect(() => {
    if (query.data) {
      setAgent(query.data);
      props?.onAgentLoaded?.(query.data);
      setConfig({
        ...defaultChatBubbleConfig,
        ...(query?.data?.interfaceConfig as AgentInterfaceConfig),
        ...props.initConfig,
      });
    }
  }, [query.data]);

  useEffect(() => {
    if (props.initConfig) {
      setConfig(props.initConfig);
    }
  }, [props.initConfig]);

  const {
    isStreaming,
    visitorId,
    conversationId,
    visitorEmail,
    refreshConversation,
  } = methods;

  const hasCapturedLead =
    !!visitorEmail ||
    !!hasSubmittedForm ||
    !!props.contact?.email ||
    !!props.contact?.phoneNumber;

  const leadToolConfig = ((agent as any)?.tools as Tool[])?.find(
    (one) => one?.type === 'lead_capture'
  )?.config as LeadCaptureToolchema['config'];

  const injectLeadFormInInitMessags =
    !!leadToolConfig?.isRequired && !hasCapturedLead;

  const leadForm = useMemo(() => {
    return (
      <LeadForm
        agentId={agentId!}
        visitorId={visitorId}
        conversationId={conversationId}
        visitorEmail={visitorEmail}
        onSubmitSucess={async (values) => {
          refreshConversation();
          setHasSubmittedForm(true);
        }}
        {...leadToolConfig}
      />
    );
  }, [
    agentId,
    visitorId,
    conversationId,
    visitorEmail,
    refreshConversation,
    leadToolConfig,
  ]);

  const initialMessages = useMemo(() => {
    let msgs = [] as string[];
    if (!!props?.initConfig?.initialMessages?.length) {
      msgs = props?.initConfig.initialMessages;
    } else {
      msgs = config?.initialMessages || [];
    }

    const m = msgs
      .map((each) => each?.trim?.())
      .filter((each) => !!each)
      .map(
        (each) =>
          ({
            from: 'agent',
            message: each.trim(),
            approvals: [],
          } as ChatMessage)
      );

    if (injectLeadFormInInitMessags) {
      m.push({
        id: 'lead-form',
        from: 'agent',
        component: leadForm,
        disableActions: true,
      } as ChatMessage);
    }
    return m;
  }, [
    props?.initConfig?.initialMessages,
    config?.initialMessages,
    injectLeadFormInInitMessags,

    leadForm,
  ]);

  const messages = useMemo(() => {
    const form = {
      id: 'lead-form',
      from: 'agent',
      component: leadForm,
      disableActions: true,
    };

    return history.reduce((acc, current, index) => {
      const shouldRendereAfterAiReply =
        history?.length >= 2 &&
        index === 1 &&
        !(history?.length === 2 && isStreaming);

      return [
        ...acc,
        current,

        // Show lead form after first AI answer when not required
        ...(!!leadToolConfig &&
        !leadToolConfig?.isRequired &&
        !hasCapturedLead &&
        shouldRendereAfterAiReply
          ? [form]
          : []),
      ] as ChatMessage[];
    }, [] as ChatMessage[]);
  }, [leadForm, history, leadToolConfig, hasCapturedLead, isStreaming]);

  useEffect(() => {
    refreshConversation();
  }, [isStreaming]);

  if (!agent) {
    return (
      <Box
        sx={{
          width: '100%',
          height: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          background: 'transparent',
          ...(props.styles ? props.styles : {}),
        }}
      >
        <CircularProgress size="sm" variant="soft" color="neutral" />
      </Box>
    );
  }

  const Layout = props.layout || React.Fragment;

  return (
    <ChatContext.Provider
      value={{
        ...methods,
        history: messages,
      }}
    >
      <Layout
        {...(props.layout
          ? {
              className: cn(mode, props.className),
              agentId: agentId,
              config,
            }
          : {})}
      >
        <Box
          className={cn({
            [`${mode} ${props.className}`]: !props.layout,
          })}
          sx={(theme) => ({
            // px: 2,
            // pb: 2,
            display: 'flex',
            flex: 1,
            flexDirection: 'column',
            position: 'relative',
            width: '100%',
            height: '100%',
            overflow: 'hidden',
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
            // pt: 6,
            // px: 2,
            // pb: 2,
            ...((props.styles ? props.styles : {}) as any),
          })}
        >
          <ChatBox
            messages={messages}
            onSubmit={handleChatSubmit}
            messageTemplates={config.messageTemplates}
            initialMessage={config.initialMessage}
            initialMessages={initialMessages}
            agentIconUrl={agent?.iconUrl! || defaultAgentIconUrl}
            agentIconStyle={props?.initConfig?.iconStyle}
            isLoadingConversation={isLoadingConversation}
            hasMoreMessages={hasMoreMessages}
            handleLoadMoreMessages={handleLoadMoreMessages}
            handleEvalAnswer={handleEvalAnswer}
            handleAbort={handleAbort}
            hideInternalSources
            // renderBottom={<CustomerSupportActions config={config} />}
            withFileUpload
            withSources={!!agent?.includeSources}
            isAiEnabled={methods.isAiEnabled}
            disableWatermark={isPremium && !!config?.isBrandingDisabled}
            // renderAfterMessages={
            //   conversationId ? (
            //     <NewChatButton
            //       sx={{
            //         position: 'absolute',
            //         left: 0,
            //         top: 0,
            //         background: 'white',
            //         zIndex: 1,
            //       }}
            //     />
            //   ) : null
            // }
            readOnly={leadToolConfig?.isRequired && !hasCapturedLead}
          />
        </Box>
      </Layout>
    </ChatContext.Provider>
  );
}

export default ChatBoxFrame;
