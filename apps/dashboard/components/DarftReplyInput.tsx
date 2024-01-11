import SmartToyRoundedIcon from '@mui/icons-material/SmartToyRounded';
import Card from '@mui/joy/Card';
import CircularProgress from '@mui/joy/CircularProgress';
import IconButton from '@mui/joy/IconButton';
import Option from '@mui/joy/Option';
import Select from '@mui/joy/Select';
import Stack from '@mui/joy/Stack';
import Tooltip from '@mui/joy/Tooltip';
import { Prisma } from '@prisma/client';
import React, { useEffect, useState } from 'react';
import useSWR from 'swr';

import useChat from '@app/hooks/useChat';
import { getAgents } from '@app/pages/api/agents';

import { fetcher } from '@chaindesk/lib/swr-fetcher';

type Props = {
  defaultAgentId?: string;
  query?: string;
  onSubmit?: (props: { query?: string; agentId: string }) => any;
  onReply?: (message: string) => any;
  conversationId?: string;
};

function DarftReplyInput({
  defaultAgentId,
  query,
  onReply,
  conversationId,
}: Props) {
  const getAgentsQuery = useSWR<Prisma.PromiseReturnType<typeof getAgents>>(
    '/api/agents',
    fetcher
  );

  const [currentDraftAgentId, setCurrentDraftAgentId] = useState<
    string | undefined
  >(defaultAgentId);

  const {
    handleChatSubmit,
    setConversationId,
    setHistory,
    isStreaming,
    history,
  } = useChat({
    disableFetchHistory: true,
    endpoint: currentDraftAgentId
      ? `/api/agents/${currentDraftAgentId}/query`
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

  return (
    <Card
      size="sm"
      sx={{
        p: 0,
        maxHeight: '100%',
        overflow: 'hidden',
      }}
      variant="outlined"
    >
      <Stack direction="row" sx={{ alignItems: 'center' }}>
        {isStreaming && (
          <CircularProgress
            size="sm"
            sx={{
              mx: 1,
              '--_root-size': '15px',
            }}
          />
        )}
        {/* <span className="relative flex w-4 h-4 mt-[0px]">
          <span className="absolute inline-flex w-full h-full bg-gray-400 rounded-full opacity-75 animate-ping"></span>
          <span className="relative inline-flex w-4 h-4 bg-gray-500 rounded-full"></span>
        </span> */}
        <Tooltip title="Draft reply from your AI Agent">
          <IconButton
            variant="soft"
            color="success"
            size="sm"
            sx={{ maxHeight: '100%' }}
            disabled={!currentDraftAgentId || isStreaming}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('currentDraftAgentId', currentDraftAgentId);

              if (currentDraftAgentId) {
                handleChatSubmit(
                  `Reply previous message, use the queryKnowledgeBase tool, use this answer as a seed if provided: answer ###${
                    query || ''
                  }### Reply: `,
                  [],
                  true
                );
              }
            }}
          >
            <SmartToyRoundedIcon />
          </IconButton>
        </Tooltip>
        <Select
          defaultValue={defaultAgentId}
          variant="plain"
          placeholder="Agent"
          sx={{ maxHeight: '100%', maxWidth: '150px' }}
          slotProps={{
            button: {
              sx: {
                overflow: 'hidden',
                maxWidth: '150px',
                textOverflow: 'ellipsis',
                display: 'block',
              },
            },
          }}
          onChange={(e, val) => {
            if (val) {
              setCurrentDraftAgentId(val as any);
            }
          }}
        >
          {getAgentsQuery.data?.map((agent) => (
            <Option key={agent.id} value={agent.id}>
              {agent.name || agent.id}
            </Option>
          ))}
        </Select>
      </Stack>
    </Card>
  );
}

export default DarftReplyInput;
