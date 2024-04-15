import cuid from 'cuid';
import { createContext, useCallback, useEffect } from 'react';
import useSWRInfinite from 'swr/infinite';
import useSWRMutation from 'swr/mutation';

import { ApiError, ApiErrorType } from '@chaindesk/lib/api-error';
import {
  EventStreamContentType,
  fetchEventSource,
} from '@chaindesk/lib/fetch-event-source';
import {
  fetcher,
  generateActionFetcher,
  HTTP_METHOD,
} from '@chaindesk/lib/swr-fetcher';
import {
  ChatMessage,
  CustomContact,
  MessageEvalUnion,
  SSE_EVENT,
} from '@chaindesk/lib/types';
import { Source } from '@chaindesk/lib/types/document';
import type {
  ChatResponse,
  CreateAttachmentSchema,
  EvalAnswer,
} from '@chaindesk/lib/types/dtos';
import type {
  ActionApproval,
  Attachment,
  Contact,
  ConversationChannel,
  ConversationStatus,
  Prisma,
  Tool,
} from '@chaindesk/prisma';
import useFileUpload from '@chaindesk/ui/hooks/useFileUpload';
import useRateLimit from '@chaindesk/ui/hooks/useRateLimit';
import useStateReducer from '@chaindesk/ui/hooks/useStateReducer';

const API_URL = process.env.NEXT_PUBLIC_DASHBOARD_URL;
type Props = {
  endpoint?: string;
  channel?: ConversationChannel;
  queryBody?: any;
  datasourceId?: string;
  localStorageConversationIdKey?: string;
  agentId?: string;
  disableFetchHistory?: boolean;
  contact?: CustomContact;
  context?: string;
};

export const ChatContext = createContext<ReturnType<typeof useChat>>({} as any);

export const handleEvalAnswer = async (props: {
  value: MessageEvalUnion;
  messageId: string;
}) => {
  let visitorId = '';
  try {
    visitorId = localStorage.getItem('visitorId') as string;
  } catch {}

  await fetch(`${API_URL}/api/conversations/eval-answer`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      eval: props.value,
      messageId: props.messageId,
      visitorId,
    } as EvalAnswer),
  });
};

const LOCAL_STORAGE_CONVERSATION_ID_KEY = 'conversationId';

const useChat = ({
  endpoint,
  channel,
  queryBody,
  disableFetchHistory,
  ...otherProps
}: Props) => {
  const localStorageConversationIdKey =
    otherProps.localStorageConversationIdKey ||
    LOCAL_STORAGE_CONVERSATION_ID_KEY;

  const [state, setState] = useStateReducer({
    history: [] as ChatMessage[],
    visitorId: '',
    conversationId: '',
    conversationStatus: 'UNRESOLVED' as any,
    hasMoreMessages: true,
    prevConversationId: '',
    mounted: false,
    handleAbort: undefined as any,
    isStreaming: false,
    isAiEnabled: true,
    isFormValid: false,
  });

  const { upload } = useFileUpload();

  // TODO: Remove when rate limit implemented from backend
  const { isRateExceeded, rateExceededMessage, handleIncrementRateLimitCount } =
    useRateLimit({
      agentId: otherProps.agentId,
    });

  const conversationChatMutation = useSWRMutation(
    state.conversationId
      ? `${API_URL}/api/conversations/${state.conversationId}/message`
      : null,
    generateActionFetcher(HTTP_METHOD.POST)
  );

  const getConversationQuery = useSWRInfinite(
    (pageIndex, previousPageData) => {
      if (!state.conversationId) {
        if (state.hasMoreMessages) {
          setState({ hasMoreMessages: false });
        }

        return null;
      }

      if (previousPageData && previousPageData?.messages?.length === 0) {
        setState({
          hasMoreMessages: false,
        });
        return null;
      }

      const cursor = previousPageData?.messages?.[
        previousPageData?.messages?.length - 1
      ]?.id as string;

      return !disableFetchHistory
        ? `${API_URL}/api/conversations/${state.conversationId}?cursor=${
            cursor || ''
          }`
        : null;
    },
    fetcher,
    {
      onSuccess: (data) => {
        if (data === null || data?.[0] === null) {
          // conversationId is invalid or does not exists (e.g: deleted by operator)
          setState({
            conversationId: '',
          });
        }
      },
      ...(state.isAiEnabled
        ? {
            // check if AI is disabled every 30 seconds
            refreshInterval: 30000,
          }
        : {
            //  If AI is disabled check for new messages every 5 seconds
            refreshInterval: 5000,
          }),
    }
  );

  const { mutate } = getConversationQuery;

  const handleLoadMoreMessages = useCallback(() => {
    if (getConversationQuery.isLoading || getConversationQuery.isValidating)
      return;

    getConversationQuery.setSize(getConversationQuery.size + 1);
  }, [getConversationQuery]);

  const handleChatSubmit = useCallback(
    async ({
      query,
      isDraft,
      files = [],
      attachmentsForAI = [],
    }: {
      query: string;
      files?: File[];
      isDraft?: Boolean;
      attachmentsForAI?: string[];
    }) => {
      const message = query?.trim?.();

      if (!message || !endpoint) {
        return;
      }

      const conversationId = state.conversationId || cuid();

      let attachments: CreateAttachmentSchema[] = [];

      if (files?.length > 0) {
        const filesUrls = await upload(
          files.map((each) => ({
            conversationId,
            agentId: otherProps.agentId!,
            case: 'chatUpload',
            fileName: each.name,
            mimeType: each.type,
            file: each,
          }))
        );
        attachments = files.map((each, index) => ({
          name: each.name,
          url: filesUrls[index],
          size: each.size,
          mimeType: each.type,
        }));
      }

      if (
        channel &&
        channel !== 'dashboard' &&
        getConversationQuery?.data &&
        !getConversationQuery?.data?.[0]?.isAiEnabled
      ) {
        await conversationChatMutation.trigger({
          from: 'human',
          message,
          channel,
          visitorId: state.visitorId,
        });
        await getConversationQuery.mutate();
        return;
      }

      if (isRateExceeded) {
        setState({
          history: [
            ...state.history,
            { from: 'agent', message: rateExceededMessage },
          ] as any,
        });
        return;
      }

      const ctrl = new AbortController();

      const history = [
        ...state.history,
        {
          from: 'human',
          message,
          attachments: attachments.map((each, index) => ({
            id: index,
            ...each,
          })),
        },
      ];
      const nextIndex = history.length;

      setState({
        history: history as any,
        isStreaming: true,
        handleAbort: () => {
          ctrl.abort();
        },
      });

      let answer = '';
      let error = '';

      try {
        let buffer = '';
        let bufferStep = '';
        let bufferEndpointResponse = '';
        let bufferToolCall = '';
        let bufferMetadata = '';
        class RetriableError extends Error {}
        class FatalError extends Error {}
        await fetchEventSource(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            // Accept: 'text/event-stream',
          },
          openWhenHidden: true,
          body: JSON.stringify({
            ...queryBody,
            streaming: true,
            query: message,
            visitorId: state.visitorId,
            conversationId: conversationId,
            channel,
            attachments,
            isDraft,
            contact: otherProps.contact,
            context: otherProps.context,
            attachmentsForAI,
          }),
          signal: ctrl.signal,

          async onopen(response) {
            if (
              response.ok &&
              response.headers.get('content-type') === EventStreamContentType
            ) {
              return; // everything's good
            } else if (
              response.status >= 400 &&
              response.status < 500 &&
              response.status !== 429
            ) {
              if (response.status === 402) {
                throw new ApiError(ApiErrorType.USAGE_LIMIT);
              }
              // client-side errors are usually non-retriable:
              throw new FatalError();
            } else {
              throw new RetriableError();
            }
          },
          onclose() {
            // if the server closes the connection unexpectedly, retry:
            throw new RetriableError();
          },
          onerror(err) {
            console.error('on error', err, Object.keys(err));
            if (err instanceof FatalError) {
              ctrl.abort();
              throw err; // rethrow to stop the operation
            } else if (err instanceof ApiError) {
              console.error('ApiError', ApiError);
              throw err;
            } else {
              // do nothing to automatically retry. You can also
              // return a specific retry interval here.
            }
          },

          onmessage: (event) => {
            console.debug('[EventSource]', event);
            if (event.data === '[DONE]') {
              ctrl.abort();

              console.debug('[answer]', buffer);
              console.log('[response]', bufferEndpointResponse);

              try {
                const {
                  sources,
                  conversationId,
                  visitorId,
                  messageId,
                  isValid,
                  ..._otherProps
                } = JSON.parse(bufferEndpointResponse) as ChatResponse & {
                  isValid: boolean;
                };

                const h = [...history];

                let metadata = {
                  ..._otherProps.metadata,
                };

                try {
                  metadata = {
                    ...metadata,
                    ...JSON.parse(bufferMetadata || '{}'),
                  };
                } catch {}

                if (h?.[nextIndex]) {
                  h[nextIndex].message = `${buffer}`;
                  (h[nextIndex] as any).id = messageId;
                  (h[nextIndex] as any).metadata = metadata;
                } else {
                  h.push({
                    id: messageId,
                    from: 'agent',
                    message: buffer,
                    sources,
                    metadata,
                    attachments: [],
                  });
                }

                setState({
                  history: h as any,
                  conversationId,
                  prevConversationId: state.conversationId,
                  visitorId,
                  isFormValid: isValid,
                });

                try {
                  localStorage.setItem('visitorId', visitorId || '');
                  localStorage.setItem(
                    localStorageConversationIdKey,
                    conversationId || ''
                  );
                } catch {}

                // ApprovalRequired case returns an empty message. Refresh ui to display associated approval requests.
                if (buffer?.trim() === '') {
                  setTimeout(() => {
                    getConversationQuery.mutate();
                  }, 1000);
                }
              } catch (err) {
                console.log(err);
              }
            } else if (event.data?.startsWith('[ERROR]')) {
              ctrl.abort();

              let message = event.data.replace('[ERROR]', '');

              if (message === ApiErrorType.USAGE_LIMIT) {
                if (!channel || channel === 'dashboard') {
                  message = `Message limit reached. Please upgrade your plan to get higher usage.`;
                } else {
                  return;
                }
              }

              setState({
                history: [
                  ...history,
                  {
                    from: 'agent',
                    message,
                  } as any,
                ],
              });
            } else if (event.event === SSE_EVENT.endpoint_response) {
              bufferEndpointResponse += decodeURIComponent(
                event.data
              ) as string;
            } else if (event.event === SSE_EVENT.step) {
              bufferStep += decodeURIComponent(event.data) as string;

              const h = [...history];

              if (h?.[nextIndex]) {
                h[nextIndex].message = `${bufferStep}`;
              } else {
                h.push({ from: 'agent', message: bufferStep, attachments: [] });
              }

              setState({
                history: h as any,
              });
            } else if (event.event === SSE_EVENT.metadata) {
              bufferMetadata += decodeURIComponent(event.data) as string;
            } else if (event.event === SSE_EVENT.tool_call) {
              bufferToolCall += event.data as string;

              const h = [...history];

              if (h?.[nextIndex]) {
                (h[nextIndex] as any).step = {
                  type: 'tool_call',
                  // description: bufferToolCall,
                };
              } else {
                h.push({
                  from: 'agent',
                  message: '',
                  step: {
                    type: 'tool_call',
                    // description: bufferToolCall,
                  },
                  attachments: [],
                });
              }

              setState({
                history: h as any,
              });
            } else if (event.event === SSE_EVENT.answer) {
              // const data = JSON.parse(event.data || `{}`);
              buffer += decodeURIComponent(event.data) as string;
              // buffer = buffer?.replace(EXTRACT_SOURCES, '');

              const h = [...history];

              if (h?.[nextIndex]) {
                h[nextIndex].message = `${buffer}`;
              } else {
                h.push({ from: 'agent', message: buffer, attachments: [] });
              }

              setState({
                history: h as any,
              });
            }
          },
        });

        handleIncrementRateLimitCount?.();
      } catch (err) {
        console.error('err', err);

        if (err instanceof ApiError) {
          if (err?.message) {
            error = err?.message;

            if (error === ApiErrorType.USAGE_LIMIT) {
              answer =
                'Usage limit reached. Please upgrade your plan to get higher usage.';
            } else {
              answer = `Error: ${error}`;
            }
          } else {
            answer = `Error: ${error}`;
          }

          setState({
            history: [
              ...history,
              { from: 'agent', message: answer as string },
            ] as any,
          });
        }
      } finally {
        setState({
          isStreaming: false,
        });
      }
    },
    [
      channel,
      endpoint,
      isRateExceeded,
      localStorageConversationIdKey,
      rateExceededMessage,
      state.conversationId,
      state.history,
      state.visitorId,
      queryBody,
      setState,
      handleIncrementRateLimitCount,
    ]
  );

  const setConversationId = useCallback(
    (value?: string) => {
      setState({
        conversationId: value || '',
      });
      try {
        localStorage.setItem(localStorageConversationIdKey, value || '');
      } catch {}
    },
    [setState]
  );

  const setVisitorId = useCallback(
    (value?: string) => {
      setState({
        visitorId: value || '',
      });
      try {
        localStorage.setItem('visitorId', value || '');
      } catch {}
    },
    [setState]
  );

  const createNewConversation = useCallback(
    (value?: string) => {
      return setConversationId(value);
    },
    [setConversationId]
  );

  const setHistory = useCallback(
    (history: ChatMessage[]) => {
      setState({
        history,
      });
    },
    [setState]
  );

  useEffect(() => {
    if (getConversationQuery.data) {
      setState({
        history: getConversationQuery.data
          ?.filter((each) => !!each)
          ?.map((each) => each?.messages)
          ?.flat()
          ?.reverse()
          ?.map((message) => ({
            id: message?.id!,
            conversationId: message?.conversationId,
            eval: message?.eval,
            from: message?.from!,
            message: message?.text!,
            createdAt: message?.createdAt!,
            sources: message?.sources as Source[],
            approvals: message?.approvals || [],
            metadata: message?.metadata || ({} as any),
            attachments: message?.attachments || ([] as Attachment[]),
            submission: message?.submission,
            iconUrl:
              message?.from === 'agent'
                ? undefined
                : message?.user?.customPicture || message?.user?.picture,
            fromName: message?.user?.name,
          })),
        conversationStatus:
          getConversationQuery.data[0]?.status ?? state.conversationStatus,
        isAiEnabled: getConversationQuery?.data?.[0]?.isAiEnabled,
      });
    }
  }, [getConversationQuery.data]);

  // useSWRInfinite needs to be retriggered!
  useEffect(() => {
    if (state.conversationId) {
      getConversationQuery.mutate();
    }
  }, [state.conversationId]);

  useEffect(() => {
    if (!state.prevConversationId && state.conversationId) {
      // New conversation
      setState({
        hasMoreMessages: false,
      });
      return;
    }

    // New conversation, reset history (for conversation switching)
    if (!state.conversationId) {
      setState({
        history: [],
      });
    }
  }, [state.conversationId]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Init from localStorage onmount (for chatbubble widget)
      try {
        const visitorId = localStorage.getItem('visitorId') as string;
        const conversationId = localStorage.getItem(
          localStorageConversationIdKey
        ) as string;

        setState({
          visitorId,
          conversationId,
        });
      } catch {}
    }
  }, [localStorageConversationIdKey]);

  const refreshConversation = useCallback(() => {
    return mutate();
  }, [mutate]);

  return {
    agentId: otherProps.agentId,
    history: state.history,
    isLoadingConversation: getConversationQuery.isLoading,
    isValidatingConversation: getConversationQuery.isValidating,
    isFomValid: state.isFormValid,
    hasMoreMessages: state.hasMoreMessages,
    visitorId: state.visitorId,
    conversationId: state.conversationId,
    handleAbort: state.handleAbort,
    conversationStatus: state.conversationStatus as ConversationStatus,
    visitorEmail: getConversationQuery?.data?.[0]?.lead?.email || '',
    contact:
      getConversationQuery?.data?.[0]?.participantsVisitors?.[0]?.contact,
    isStreaming: state.isStreaming,
    isAiEnabled: state.isAiEnabled,
    conversationAttachments: getConversationQuery?.data?.[0]?.attachments || [],
    createNewConversation,
    handleChatSubmit,
    handleLoadMoreMessages: handleLoadMoreMessages,
    setConversationId,
    setVisitorId,
    handleEvalAnswer,
    setHistory,
    refreshConversation,
  };
};

export default useChat;
