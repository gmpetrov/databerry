import React, { useEffect, useMemo } from 'react';

import { ChatboxEvent, ChatMessage } from '@chaindesk/lib/types';
import { LeadCaptureToolchema } from '@chaindesk/lib/types/dtos';
import { AgentInterfaceConfig } from '@chaindesk/lib/types/models';
import { Agent, Subscription, SubscriptionPlan, Tool } from '@chaindesk/prisma';
import Base, { ChatBaseProps } from '@chaindesk/ui/embeds/chat-base';
import { InitWidgetProps } from '@chaindesk/ui/embeds/types';
import useAgent from '@chaindesk/ui/hooks/useAgent';
import useChat, { ChatContext } from '@chaindesk/ui/hooks/useChat';
import LeadForm from '@chaindesk/ui/LeadForm';
import Actions from './Chatbox/Actions';

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
  children?: any;
  isOpen?: boolean;
  onEnd?: (data: any) => void;
};

function ChatBoxLoader(props: ChatBoxStandardProps) {
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
    conversationAttachments,
    handleChatSubmit,
    handleLoadMoreMessages,
    handleEvalAnswer,
  } = methods;

  useEffect(() => {
    if (props.initConfig) {
      setConfig(props.initConfig);
    }
  }, [props.initConfig]);

  const subscription = (agent as any)?.organization
    ?.subscriptions?.[0] as Subscription;
  const isPremium = !!subscription;
  const hideBranding =
    isPremium &&
    [SubscriptionPlan.level_2, SubscriptionPlan.level_3].includes(
      subscription?.plan as any
    ) &&
    !!config?.isBrandingDisabled;

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
  const hasMarkAsResolvedTool = useMemo(
    () =>
      !!((agent as any)?.tools as Tool[])?.find(
        (one) => one?.type === 'mark_as_resolved'
      ),
    [agent]
  );
  const hasRequestHumanTool = useMemo(
    () =>
      !!((agent as any)?.tools as Tool[])?.find(
        (one) => one?.type === 'request_human'
      ),
    [agent]
  );

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
    if (typeof window === 'undefined') {
      return;
    }

    document.addEventListener(
      ChatboxEvent.CREATE_NEW_CONVERSATION,
      methods.createNewConversation as any
    );

    return () => {
      document.removeEventListener(
        ChatboxEvent.CREATE_NEW_CONVERSATION,
        methods.createNewConversation as any
      );
    };
  }, [methods.createNewConversation]);

  return (
    <ChatContext.Provider
      value={{
        ...methods,
        history: messages,
      }}
    >
      {React.createElement(props.children || Base, {
        isOpen: props.isOpen,
        isLoadingAgent: !agent,
        agentId: agentId,
        agentIconUrl: agent?.iconUrl,
        layout: props.layout,
        interfaceConfig: config,
        layoutClassName: props.className,
        containerSxProps: props.styles,
        chatBoxProps: {
          isOpen: props.isOpen,
          messages: messages,
          onSubmit: handleChatSubmit,
          messageTemplates: config.messageTemplates,
          initialMessage: config.initialMessage,
          initialMessages: initialMessages,
          agentIconUrl: agent?.iconUrl! || defaultAgentIconUrl,
          agentIconStyle: props?.initConfig?.iconStyle,
          isLoadingConversation: isLoadingConversation,
          hasMoreMessages: hasMoreMessages,
          handleLoadMoreMessages: handleLoadMoreMessages,
          handleEvalAnswer: handleEvalAnswer,
          handleAbort: handleAbort,
          withSources: !!agent?.includeSources,
          isAiEnabled: methods.isAiEnabled,
          disableWatermark: hideBranding,
          isStreaming,
          readOnly: leadToolConfig?.isRequired && !hasCapturedLead,
          hideInternalSources: true,
          withFileUpload: true,
          conversationAttachments,
          actions: (
            <Actions
              withHumanRequested={hasRequestHumanTool}
              withMarkAsResolved={hasMarkAsResolvedTool}
            />
          ),
        },
      } as ChatBaseProps)}
    </ChatContext.Provider>
  );
}

export default ChatBoxLoader;
