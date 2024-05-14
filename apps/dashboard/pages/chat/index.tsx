import MemoryRoundedIcon from '@mui/icons-material/MemoryRounded';
import StorageRoundedIcon from '@mui/icons-material/StorageRounded';
import { CircularProgress } from '@mui/joy';
import Autocomplete from '@mui/joy/Autocomplete';
import AutocompleteOption from '@mui/joy/AutocompleteOption';
import Box from '@mui/joy/Box';
import Option from '@mui/joy/Option';
import Select from '@mui/joy/Select';
import Stack from '@mui/joy/Stack';
import axios from 'axios';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import pDebounce from 'p-debounce';
import { ReactElement } from 'react';
import * as React from 'react';
import toast from 'react-hot-toast';
import useSWR from 'swr';

import ChatSection from '@app/components/ChatSection';
import DatasourceViewer from '@app/components/DatasourceViewer';
import EmptyMainChatCard from '@app/components/EmptyMainChatCard';
import Layout from '@app/components/Layout';

import { fetcher } from '@chaindesk/lib/swr-fetcher';
import { ChainType } from '@chaindesk/lib/types';
import { Source } from '@chaindesk/lib/types/document';
import { AppDatasource, DatasourceType, Prisma } from '@chaindesk/prisma';
import useChat from '@chaindesk/ui/hooks/useChat';
import useStateReducer from '@chaindesk/ui/hooks/useStateReducer';

import { getChunk } from '../api/datasources/[id]/chunks/[chunkId]';
import { searchRessources } from '../api/ressources';

type KnowledgeOption = {
  type: 'agents' | 'datasources' | 'datastores';
  label: string;
  mime_type?: string;
  id: string;
};

export default function ChatPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [state, setState] = useStateReducer({
    currentChainType: ChainType.qa,
    ressourcesQuery: '',
    selectedKnowledgeOptions: [] as KnowledgeOption[],
    chatFilters: {
      datastore_ids: [] as string[],
      datasource_ids: [] as string[],
    },
    viewerSearch: undefined as string | undefined,
    viewerPageNumber: undefined as number | undefined,
  });

  const getRessources = useSWR<
    Prisma.PromiseReturnType<typeof searchRessources>
  >(`/api/ressources?search=${state.ressourcesQuery}`, fetcher);

  const {
    history,
    handleChatSubmit,
    isLoadingConversation,
    hasMoreMessages,
    handleLoadMoreMessages,
    setConversationId,
    conversationId: currentConversationId,
    isStreaming,
    handleAbort,
    refreshConversation,
  } = useChat({
    channel: 'dashboard',
    endpoint: `/api/chains/run`,
    queryBody: {
      filters: state.chatFilters,
      chainType: state.currentChainType,
    },
    localStorageConversationIdKey: 'mainChatConversationId',
  });

  const handleSourceClick = React.useCallback(
    (source: Source) => {
      if (
        source.datasource_type === DatasourceType.file &&
        source.mime_type === 'application/pdf'
      ) {
        router.query.chunkId = source.chunk_id;
        router.query.datasourceId = source.datasource_id;
        router.replace(router, undefined, { shallow: true });
      } else if (source.source_url) {
        window.open(source.source_url, '_blank');
      }
    },
    [router]
  );

  const ressources = React.useMemo(() => {
    if (!getRessources?.data) return [];

    return Object.keys(getRessources?.data)
      .map((key) =>
        (getRessources as any).data?.[key as any]?.map((each: any) => ({
          type: key,
          key: each.id,
          // label: `${each.name} (${each.id})`,
          label: `${each.name}`,
          id: each.id,
          mime_type: each?.config?.mime_type as string,
        }))
      )
      .flat()
      .filter((each) => each.type !== 'agents');
  }, [getRessources?.data]);

  const datasourceViewId = React.useMemo(() => {
    const options = state.selectedKnowledgeOptions?.filter(
      (each) => each.mime_type === 'application/pdf'
    );

    if (options?.length > 1) {
      return undefined;
    }

    return options?.[0]?.id;
  }, [state.selectedKnowledgeOptions]);

  const handleExamplePromptClick = (prompt: string) => {
    const input = document.getElementById('chatbox-input') as HTMLInputElement;

    if (input) {
      input.value = prompt;
    }
  };

  const Settings = (
    <Stack direction="row" gap={0.5} justifyContent={'flex-end'}>
      <Select
        size="sm"
        variant="outlined"
        placeholder="chain"
        startDecorator={<MemoryRoundedIcon />}
        sx={{ mt: 'auto' }}
        value={state.currentChainType}
      >
        <Option value="qa">Q&A</Option>
        {/* <Option value="agent">Agent</Option> */}
      </Select>

      <Autocomplete
        size="sm"
        placeholder="knowledge"
        variant="outlined"
        multiple
        options={ressources}
        isOptionEqualToValue={(option, value) => option.id === value.id}
        value={state.selectedKnowledgeOptions}
        groupBy={(option) => option?.type}
        sx={{
          mr: 'auto',
          '.MuiChip-root': {
            maxWidth: '200px',
          },
        }}
        startDecorator={<StorageRoundedIcon />}
        loading={getRessources?.isLoading}
        onChange={(_, value) => {
          console.log('value', value);
          setState({
            selectedKnowledgeOptions: value,
          });
        }}
        onInputChange={pDebounce((e) => {
          const value = (e as any).target.value as string;

          setState({
            ressourcesQuery: value,
          });
        }, 500)}
        selectOnFocus
        clearOnBlur
        handleHomeEndKeys
        limitTags={3}
        endDecorator={
          getRessources?.isLoading ? <CircularProgress size="sm" /> : null
        }
        renderOption={(props, option) => (
          <AutocompleteOption {...props} key={option.id}>
            {option.label}
          </AutocompleteOption>
        )}
      />
    </Stack>
  );

  const handleSelectConversation = (conversationId: string) => {
    setConversationId(conversationId);
    router.query.conversationId = conversationId;
    router.replace(router, undefined, {
      shallow: true,
    });
    if (currentConversationId !== conversationId) {
      setState({
        selectedKnowledgeOptions: [],
      });
    }
  };

  const handleCreateNewChat = () => {
    handleAbort();
    setConversationId('');
    setState({
      selectedKnowledgeOptions: [],
    });
    router.query.conversationId = '';
    router.replace(router, undefined, {
      shallow: true,
    });
  };

  React.useEffect(() => {
    const filters = {
      datastore_ids: [],
      datasource_ids: [],
    } as typeof state.chatFilters;

    state.selectedKnowledgeOptions.forEach((each) => {
      if (each.type === 'datastores') {
        filters.datastore_ids.push(each.id);
      }

      if (each.type === 'datasources') {
        filters.datasource_ids.push(each.id);
      }
    });

    setState({
      chatFilters: filters,
    });
  }, [state.selectedKnowledgeOptions]);

  React.useEffect(() => {
    (async () => {
      try {
        const id = router.query.datasourceId as string;
        const chunkId = router.query.chunkId as string;
        let chunkText = undefined as string | undefined;
        let chunkPageNumber = 0 as number;

        if (!id) {
          return;
        }

        const res = await axios.get('/api/datasources/' + id);
        const datasource = res.data as AppDatasource;

        if (datasource) {
          if (chunkId) {
            const chunkRes = await axios.get(
              `/api/datasources/${id}/chunks/${chunkId}`
            );
            const chunk = chunkRes.data as Awaited<ReturnType<typeof getChunk>>;
            chunkText = chunk.pageContent;
            chunkPageNumber = chunk?.metadata?.page_number || 0;
          }

          setState({
            viewerSearch: chunkText,
            viewerPageNumber: chunkPageNumber,
            selectedKnowledgeOptions: [
              {
                id,
                label: datasource.name,
                type: 'datasources',
                mime_type: (datasource as any)?.config?.mime_type,
              },
            ],
          });

          setTimeout(() => {
            setState({
              viewerPageNumber: undefined,
            });
          }, 5000);
        }
      } catch (err) {
        toast.error('Datasource was not found. Has it been deleted?', {
          duration: 5000,
        });
        console.log(err);
      }

      delete router.query.datasourceId;
      delete router.query.chunkId;
      router.replace(router, undefined, { shallow: true });
    })();
  }, [router.query.datasourceId, router.query.chunkId]);

  return (
    <Box
      component="main"
      className="MainContent"
      sx={(theme) => ({
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
        width: '100%',
        height: '100%',
        gap: 1,
      })}
    >
      <>
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            height: '100%',
            maxHeight: '100%',
            overflow: 'hidden',
          }}
        >
          <Stack
            direction="row"
            sx={{
              width: '100%',
              height: '100%',
              maxHeight: '100%',
              overflow: 'hidden',
            }}
            gap={1}
          >
            <ChatSection
              currentConversationId={currentConversationId}
              handleSelectConversation={handleSelectConversation}
              handleCreateNewChat={handleCreateNewChat}
              disableWatermark
              messages={history}
              onSubmit={handleChatSubmit}
              isLoadingConversation={isLoadingConversation}
              hasMoreMessages={hasMoreMessages}
              handleLoadMoreMessages={handleLoadMoreMessages}
              topSettings={Settings}
              handleSourceClick={handleSourceClick}
              handleAbort={handleAbort}
              emptyComponent={
                <EmptyMainChatCard
                  handlePromptClick={handleExamplePromptClick}
                />
              }
              userImgUrl={session?.user?.image!}
              refreshConversation={refreshConversation}
              autoFocus
              isStreaming={isStreaming}
            />

            {datasourceViewId && (
              <div className="w-full h-full">
                <DatasourceViewer
                  datasourceId={datasourceViewId}
                  pageNumber={state.viewerPageNumber}
                  search={state.viewerSearch}
                />
              </div>
            )}
          </Stack>
        </Box>
      </>
    </Box>
  );
}

ChatPage.getLayout = function getLayout(page: ReactElement) {
  return (
    <Layout
      mainSxProps={{
        p: {
          xs: 2,
          sm: 0,
        },
      }}
    >
      {page}
    </Layout>
  );
};
