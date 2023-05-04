import {
  EventStreamContentType,
  fetchEventSource,
} from '@microsoft/fetch-event-source';
import { Box, Divider, Typography } from '@mui/joy';
import { GetServerSidePropsContext } from 'next/types';
import { ReactElement } from 'react';
import * as React from 'react';

import ChatBox from '@app/components/ChatBox';
import Layout from '@app/components/Layout';
import useStateReducer from '@app/hooks/useStateReducer';
import { ApiError, ApiErrorType } from '@app/utils/api-error';

export default function DatasourcesPage() {
  const scrollableRef = React.useRef<HTMLDivElement>(null);
  const [state, setState] = useStateReducer({
    agentId: 'clh9ldhip0000e9ogeunjdqhd',
    loading: false,
  });

  const [messages, setMessages] = React.useState(
    [] as { from: 'human' | 'agent'; message: string }[]
  );

  const handleChatSubmit = async (message: string) => {
    if (!message) {
      return;
    }

    const history = [...messages, { from: 'human', message }];
    const nextIndex = history.length;

    setMessages(history as any);

    let answer = '';
    let error = '';

    try {
      const ctrl = new AbortController();
      let buffer = '';

      class RetriableError extends Error {}
      class FatalError extends Error {}

      await fetchEventSource(
        `https://app.databerry.ai/api/external/agents/${state.agentId}/query`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            // Accept: 'text/event-stream',
          },
          body: JSON.stringify({
            streaming: true,
            query: message,
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
            console.log('on error', err, Object.keys(err));
            if (err instanceof FatalError) {
              ctrl.abort();
              throw err; // rethrow to stop the operation
            } else if (err instanceof ApiError) {
              console.log('ApiError', ApiError);
              throw err;
            } else {
              // do nothing to automatically retry. You can also
              // return a specific retry interval here.
            }
          },

          onmessage: (event) => {
            if (event.data === '[DONE]') {
              ctrl.abort();
            } else if (event.data?.startsWith('[ERROR]')) {
              ctrl.abort();

              setMessages([
                ...history,
                {
                  from: 'agent',
                  message: event.data.replace('[ERROR]', ''),
                } as any,
              ]);
            } else {
              // const data = JSON.parse(event.data || `{}`);
              buffer += decodeURIComponent(event.data) as string;
              console.log(buffer);

              const h = [...history];

              if (h?.[nextIndex]) {
                h[nextIndex].message = `${buffer}`;
              } else {
                h.push({ from: 'agent', message: buffer });
              }

              setMessages(h as any);
            }
          },
        }
      );
    } catch (err) {
      console.log('err', err);
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

        setMessages([
          ...messages,
          { from: 'agent', message: answer as string },
        ]);
      }
    }
  };

  React.useEffect(() => {
    if (!scrollableRef.current) {
      return;
    }

    scrollableRef.current.scrollTo(0, scrollableRef.current.scrollHeight);
  }, [messages?.length]);

  return (
    <Box
      component="main"
      className="MainContent"
      sx={(theme) => ({
        position: 'relative',
        width: '100%',
        height: '100%',
        maxHeight: '100%',
        overflow: 'hidden',
        px: {
          xs: 2,
          md: 6,
        },
        pt: {},
        pb: {
          xs: 2,
          sm: 2,
          md: 3,
        },
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
        gap: 1,
      })}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          my: 1,
          gap: 1,
          flexWrap: 'wrap',
        }}
      >
        <Typography level="h1" fontSize="xl4">
          Taskade - Demo
        </Typography>
      </Box>
      <Divider sx={{ mt: 2 }} />

      <Box
        sx={{
          position: 'relative',
          width: '100%',
          height: '100%',
          maxHeight: '100%',
        }}
      >
        <ChatBox messages={messages} onSubmit={handleChatSubmit} />
      </Box>
    </Box>
  );
}

DatasourcesPage.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  return {
    props: {},
  };
};
