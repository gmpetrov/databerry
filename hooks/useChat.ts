import {
  EventStreamContentType,
  fetchEventSource,
} from '@microsoft/fetch-event-source';
import type { ConversationChannel, Prisma } from '@prisma/client';
import { useCallback, useEffect } from 'react';
import { useSWRConfig } from 'swr';
import useSWRInfinite from 'swr/infinite';

import { getConversation } from '@app/pages/api/conversations/[conversationId]';
import { SSE_EVENT } from '@app/types';
import { Source } from '@app/types/document';
import type { ChatResponse } from '@app/types/dtos';
import { ApiError, ApiErrorType } from '@app/utils/api-error';
import { EXTRACT_SOURCES } from '@app/utils/regexp';
import { fetcher } from '@app/utils/swr-fetcher';

import useStateReducer from './useStateReducer';

const API_URL = process.env.NEXT_PUBLIC_DASHBOARD_URL;

type Props = {
  endpoint?: string;
  channel?: ConversationChannel;
  queryBody?: any;
  datasourceId?: string;
};

const useChat = ({ endpoint, channel, queryBody, ...otherProps }: Props) => {
  const { mutate, cache } = useSWRConfig();

  const [state, setState] = useStateReducer({
    visitorId: '',
    conversationId: '',
    hasMoreMessages: true,
    prevConversationId: '',
    mounted: false,
    history: [] as {
      from: 'human' | 'agent';
      message: string;
      id?: string;
      sources?: Source[];
    }[],
  });

  const getConversationQuery = useSWRInfinite<
    Prisma.PromiseReturnType<typeof getConversation>
  >(
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

      return `${API_URL}/api/conversations/${state.conversationId}?cursor=${
        cursor || ''
      }`;
    },
    fetcher,
    {
      onSuccess: (data) => {
        setState({
          history: data
            ?.map((each) => each?.messages)
            ?.flat()
            ?.reverse()
            ?.map((message) => ({
              id: message?.id!,
              from: message?.from!,
              message: message?.text!,
              createdAt: message?.createdAt!,
              sources: message?.sources as Source[],
            })),
        });
      },
    }
  );

  const handleLoadMoreMessages = () => {
    if (getConversationQuery.isLoading || getConversationQuery.isValidating)
      return;

    getConversationQuery.setSize(getConversationQuery.size + 1);
  };

  const handleChatSubmit = async (message: string) => {
    if (!message || !endpoint) {
      return;
    }

    const history = [...state.history, { from: 'human', message }];
    const nextIndex = history.length;

    setState({
      history: history as any,
    });

    let answer = '';
    let error = '';

    try {
      const ctrl = new AbortController();
      let buffer = '';
      let bufferEndpointResponse = '';
      class RetriableError extends Error {}
      class FatalError extends Error {}

      await fetchEventSource(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Accept: 'text/event-stream',
        },
        body: JSON.stringify({
          ...queryBody,
          streaming: true,
          query: message,
          visitorId: state.visitorId,
          conversationId: state.conversationId,
          channel,
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
              const { sources, conversationId, visitorId } = JSON.parse(
                bufferEndpointResponse
              ) as ChatResponse;

              const h = [...history];

              if (h?.[nextIndex]) {
                h[nextIndex].message = `${buffer}`;
              } else {
                h.push({ from: 'agent', message: buffer, sources });
              }

              localStorage.setItem('visitorId', visitorId || '');
              localStorage.setItem('conversationId', conversationId || '');

              setState({
                history: h as any,
                conversationId,
                prevConversationId: state.conversationId,
                visitorId,
              });
            } catch (err) {
              console.log(err);
            }
          } else if (event.data?.startsWith('[ERROR]')) {
            ctrl.abort();

            setState({
              history: [
                ...history,
                {
                  from: 'agent',
                  message: event.data.replace('[ERROR]', ''),
                } as any,
              ],
            });
          } else if (event.event === SSE_EVENT.endpoint_response) {
            bufferEndpointResponse += decodeURIComponent(event.data) as string;
          } else if (event.event === SSE_EVENT.answer) {
            // const data = JSON.parse(event.data || `{}`);
            buffer += decodeURIComponent(event.data) as string;
            // buffer = buffer?.replace(EXTRACT_SOURCES, '');

            const h = [...history];

            if (h?.[nextIndex]) {
              h[nextIndex].message = `${buffer}`;
            } else {
              h.push({ from: 'agent', message: buffer });
            }

            setState({
              history: h as any,
            });
          }
        },
      });
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
    }
  };

  const setConversationId = useCallback((value?: string) => {
    localStorage.setItem('conversationId', value || '');
    setState({
      conversationId: value || '',
    });
  }, []);

  const setVisitorId = useCallback((value?: string) => {
    localStorage.setItem('visitorId', value || '');
    setState({
      visitorId: value || '',
    });
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Init from localStorage onmount (for chatbubble widget)
      setState({
        visitorId: localStorage.getItem('visitorId') as string,
        conversationId: localStorage.getItem('conversationId') as string,
      });
    }
  }, []);

  useEffect(() => {
    if (!state.prevConversationId && state.conversationId) {
      // New conversation
      setState({
        hasMoreMessages: false,
      });
      return;
    }

    // Conversation changed, reset history (for conversation switching)
    setState({
      history: [],
    });
  }, [state.conversationId]);

  return {
    handleChatSubmit,
    history: state.history,
    isLoadingConversation: getConversationQuery.isLoading,
    hasMoreMessages: state.hasMoreMessages,
    handleLoadMoreMessages: handleLoadMoreMessages,
    visitorId: state.visitorId,
    conversationId: state.conversationId,
    setConversationId,
    setVisitorId,
  };
};

export default useChat;
