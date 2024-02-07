import { ChevronDownIcon } from '@heroicons/react/20/solid';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import BadgeIcon from '@mui/icons-material/Badge';
import CompressIcon from '@mui/icons-material/Compress';
import LiquorIcon from '@mui/icons-material/Liquor';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import SignLanguageIcon from '@mui/icons-material/SignLanguage';
import { Option, Select, Tooltip, Typography } from '@mui/joy';
import Dropdown from '@mui/joy/Dropdown';
import IconButton from '@mui/joy/IconButton';
import ListDivider from '@mui/joy/ListDivider';
import ListItem from '@mui/joy/ListItem';
import Menu from '@mui/joy/Menu';
import MenuButton from '@mui/joy/MenuButton';
import MenuItem from '@mui/joy/MenuItem';
import React, { useEffect } from 'react';
import useSWR from 'swr';

import useChat from '@app/hooks/useChat';
import useStateReducer from '@app/hooks/useStateReducer';
import { getAgents } from '@app/pages/api/agents';

import { fetchEventSource } from '@chaindesk/lib/fetch-event-source';
import { fetcher } from '@chaindesk/lib/swr-fetcher';
import { SSE_EVENT } from '@chaindesk/lib/types';
import { Prisma } from '@chaindesk/prisma';

import Loader from './Loader';

interface MenuItem {
  name: string;
  icon: JSX.Element;
  action: ActionsSystemPrompt;
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

enum ActionsSystemPrompt {
  grammar = `The text provided by the user may contain grammatical errors. Analyze the text for grammatical correctness, 
  identify any issues with punctuation, sentence structure, verb tenses, and word usage. Provide a grammatically correct 
  version of the text, ensuring that it maintains the original meaning and context intended by the user.`,
  summarize = `The user has provided detailed text that needs to be made more concise. Extract the key points and main ideas
   from the text. Create a succinct summary that captures the essence of the message but is significantly shorter in length. 
   The summary should be clear, coherent, and retain all critical information.`,
  casual = `The user's message may come across as overly formal or stiff. Your task is to transform the message into one that 
  is casual and relaxed. Use conversational language and a friendly tone, akin to how one might chat with a friend or a casual acquaintance.
   Ensure the message remains true to the user's original intent.`,
  formal = `The user's text may be casual or informal and needs to be professionalized. Please elevate the language to a formal register
   suitable for a professional or academic environment. Employ appropriate terminology, polite expressions, and a respectful tone while 
   preserving the original message's intent and information content.`,
  fun = `The user's message is to be reimagined in a fun, lighthearted manner. Inject humor, playfulness, and a spirited tone into the content.
   Get creative and add an element of entertainment to the message while ensuring that the fundamental message is still communicated effectively
    to the audience.`,
}

type Props = {
  defaultAgentId?: string;
  query?: string;
  onSubmit?: (props: { query?: string; agentId: string }) => any;
  onReply?: (message: string) => any;
  conversationId?: string;
  inputRef?: any;
};

function DarftReplyInput({
  inputRef,
  defaultAgentId,
  query,
  onReply,
  conversationId,
}: Props) {
  const getAgentsQuery = useSWR<Prisma.PromiseReturnType<typeof getAgents>>(
    '/api/agents',
    fetcher
  );

  const [state, setState] = useStateReducer({
    currentDraftAgentId: defaultAgentId,
    loading: false,
    isMenuOpen: false,
    // used to control the display the menu
    forceOpen: false,
  });
  const {
    handleChatSubmit,
    setConversationId,
    setHistory,
    isStreaming,
    history,
  } = useChat({
    disableFetchHistory: true,
    endpoint: state.currentDraftAgentId
      ? `/api/agents/${state.currentDraftAgentId}/query`
      : undefined,
    localStorageConversationIdKey: `draftReply`,
    // channel: ConversationChannel.form,
  });

  console.log('HISTORY', history);

  const reply = history?.length > 1 ? history[history.length - 1]?.message : '';

  console.log('reply', reply);

  useEffect(() => {
    if (reply) {
      onReply?.(reply);
    }
  }, [reply, onReply]);

  useEffect(() => {
    if (!isStreaming) {
      setHistory([]);
    }
  }, [isStreaming, setHistory]);

  useEffect(() => {
    setConversationId(conversationId);
  }, [conversationId, setConversationId]);

  const rephraseAI = async (action: ActionsSystemPrompt) => {
    const content = inputRef.current.value;

    if (content.trim() === '') return;

    setState({
      loading: true,
    });
    const ctrl = new AbortController();

    let responseBuffer = '';
    let backup = content;
    inputRef.current.value = '';
    await fetchEventSource(
      `${process.env.NEXT_PUBLIC_DASHBOARD_URL}/api/agents/query`,
      {
        method: 'POST',
        openWhenHidden: true,
        signal: ctrl.signal,
        body: JSON.stringify({
          content,
          action,
        }),
        onmessage: (event) => {
          if (event.data === '[DONE]') {
            setState({
              loading: false,
            });
            try {
              ctrl.abort();
            } catch (err) {
              console.error(err);
              inputRef.current.value = backup;
            }
          } else {
            if (event.event === SSE_EVENT.answer) {
              responseBuffer = decodeURIComponent(event.data);
              inputRef.current.value += responseBuffer;
            }
          }
        },
      }
    );
  };

  const menuSections = [
    {
      title: 'Improve Text',
      items: [
        {
          name: 'Fix Grammar',
          icon: <AutoFixHighIcon color="primary" />,
          action: ActionsSystemPrompt.grammar,
        },
        {
          name: 'Make Shorter',
          icon: <CompressIcon color="primary" />,
          action: ActionsSystemPrompt.summarize,
        },
      ],
    },
    {
      title: 'Change Tone',
      items: [
        {
          name: 'More Casual',
          icon: <SignLanguageIcon color="primary" />,
          action: ActionsSystemPrompt.casual,
        },
        {
          name: 'More Formal',
          icon: <BadgeIcon color="primary" />,
          action: ActionsSystemPrompt.formal,
        },
        {
          name: 'More Fun',
          icon: <LiquorIcon color="primary" />,
          action: ActionsSystemPrompt.fun,
        },
      ],
    },
  ] satisfies MenuSection[];

  return (
    <Dropdown
      open={state.isMenuOpen}
      defaultOpen={false}
      onOpenChange={() =>
        setState({ isMenuOpen: state.forceOpen ? true : !state.isMenuOpen })
      }
    >
      <MenuButton
        disabled={state.loading}
        variant="outlined"
        color="primary"
        endDecorator={
          state.loading ? (
            <></>
          ) : (
            <ChevronDownIcon style={{ width: '1rem', height: '1rem' }} />
          )
        }
      >
        {state.loading ? <Loader /> : 'Ask AI'}
      </MenuButton>
      <Menu
        sx={{
          boxShadow: '0 0 4px 0 rgba(128, 0, 128, 0.7)',
        }}
      >
        <ListItem
          onClick={() => {
            setState({ forceOpen: true });
          }}
        >
          <Select
            defaultValue={defaultAgentId}
            onListboxOpenChange={() => setState({ forceOpen: false })}
            variant="outlined"
            placeholder="Agent"
            sx={{
              maxHeight: '100%',
              width: '140px',
              textDecoration: 'truncate',
            }}
            onChange={(e, val) => {
              if (val) {
                setState({ currentDraftAgentId: val });
              }
            }}
          >
            {getAgentsQuery.data?.map((agent) => (
              <Option key={agent.id} value={agent.id}>
                {agent.name || agent.id}
              </Option>
            ))}
          </Select>
          <Tooltip title="Draft reply from your AI Agent">
            <IconButton
              size="sm"
              disabled={state.loading || !state.currentDraftAgentId}
              color="primary"
              variant="soft"
            >
              <SendRoundedIcon />
            </IconButton>
          </Tooltip>
        </ListItem>
        <ListDivider />
        {menuSections.map((section, index) => (
          <React.Fragment key={index}>
            <ListItem sticky>
              <Typography level="body-lg">{section.title}</Typography>
            </ListItem>
            {section.items.map((item, itemIndex) => (
              <MenuItem key={itemIndex} onClick={() => rephraseAI(item.action)}>
                {item.icon}
                {item.name}
              </MenuItem>
            ))}
            {index < menuSections.length - 1 && <ListDivider />}
          </React.Fragment>
        ))}
      </Menu>
    </Dropdown>
  );
}
export default DarftReplyInput;
