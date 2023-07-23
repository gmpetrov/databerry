import {
  EventStreamContentType,
  fetchEventSource,
} from '@microsoft/fetch-event-source';
import type { ConversationChannel, Prisma } from '@prisma/client';
import useSWR from 'swr';

import { getHistory } from '@app/pages/api/agents/[id]/history/[sessionId]';
import { Source } from '@app/types/document';
import { ApiError, ApiErrorType } from '@app/utils/api-error';
import { EXTRACT_SOURCES } from '@app/utils/regexp';
import { fetcher } from '@app/utils/swr-fetcher';

import useStateReducer from './useStateReducer';
import useVisitorId from './useVisitorId';

type Props = {
  queryAgentURL: string;
  queryHistoryURL?: string;
  channel?: ConversationChannel;
  queryBody?: any;
  datasourceId?: string;
};

const useAgentChat = ({
  queryAgentURL,
  queryHistoryURL,
  channel,
  queryBody,
}: Props) => {
  const [state, setState] = useStateReducer({
    history: [] as {
      from: 'human' | 'agent';
      message: string;
      id?: string;
      sources?: Source[];
    }[],
  });

  const { visitorId } = useVisitorId();

  const getHistoryQuery = useSWR<Prisma.PromiseReturnType<typeof getHistory>>(
    queryHistoryURL,
    fetcher,
    {
      onSuccess: (data) => {
        setState({
          history: [
            ...(data?.messages || [])?.map((message) => ({
              id: message.id,
              from: message.from,
              message: message.text,
              createdAt: message.createdAt,
            })),
            ...state.history.filter(
              // Remove messages with undefined IDs + remove duplicates (messages coming from the API)
              (message) =>
                !!message.id &&
                !data?.messages?.find((m) => m.id === message.id)
            ),
          ],
        });
      },
    }
  );

  const handleChatSubmit = async (message: string) => {
    if (!message) {
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
      let bufferSources = '';
      let sources = [] as Source[];

      class RetriableError extends Error {}
      class FatalError extends Error {}

      await fetchEventSource(queryAgentURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Accept: 'text/event-stream',
        },
        body: JSON.stringify({
          ...queryBody,
          streaming: true,
          query: message,
          visitorId: visitorId,
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
            console.debug('[sources]', bufferSources);

            try {
              sources = JSON.parse(bufferSources) as Source[];

              const h = [...history];

              if (h?.[nextIndex]) {
                h[nextIndex].message = `${buffer}`;
              } else {
                h.push({ from: 'agent', message: buffer, sources });
              }

              setState({
                history: h as any,
              });
            } catch {}
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
          } else if (event.event === 'CHAINDESKSOURCES') {
            bufferSources += decodeURIComponent(event.data) as string;
          } else {
            // const data = JSON.parse(event.data || `{}`);
            buffer += decodeURIComponent(event.data) as string;
            buffer = buffer?.replace(EXTRACT_SOURCES, '');

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

  return {
    handleChatSubmit,
    history: state.history,
  };
};

export default useAgentChat;
