import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import { Box, Button, CircularProgress, Stack, Typography } from '@mui/joy';
import colors from '@mui/joy/colors';
import {
  CssVarsProvider,
  extendTheme,
  StyledEngineProvider,
  ThemeProvider,
} from '@mui/joy/styles';
import Avatar from '@mui/material/Avatar';
import { Agent, Prisma } from '@prisma/client';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { ReactElement, useMemo } from 'react';
import useSWR from 'swr';

import useStateReducer from '@app/hooks/useStateReducer';
import { getAgent } from '@app/pages/api/external/agents/[id]';
import { AgentInterfaceConfig } from '@app/types/models';
import pickColorBasedOnBgColor from '@app/utils/pick-color-based-on-bgcolor';
import { fetcher } from '@app/utils/swr-fetcher';

function App() {
  const router = useRouter();
  const agentId = router.query.agentId;

  const [state, setState] = useStateReducer({
    agent: undefined as Agent | undefined,
    config: {},
  });

  const getAgentConfigQuery = useSWR<Prisma.PromiseReturnType<typeof getAgent>>(
    `/api/external/agents/${agentId}`,
    fetcher
  );

  const agent = getAgentConfigQuery?.data;
  const interfaceConfig = agent?.interfaceConfig as AgentInterfaceConfig;

  // const primaryColor = interfaceConfig?.primaryColor || '#ffffff';
  const primaryColor = '#ffffff';

  const textColor = useMemo(() => {
    return pickColorBasedOnBgColor(primaryColor, '#ffffff', '#000000');
  }, [primaryColor]);

  const handleFetchAgent = async () => {
    try {
      const res = await fetch(`/api/external/agents/${agentId}`);
      const data = (await res.json()) as Agent;

      const agentConfig = data?.interfaceConfig as AgentInterfaceConfig;

      setState({
        agent: data,
        config: agentConfig,
      });
    } catch (err) {
      console.error(err);
    } finally {
    }
  };

  if (!agent && getAgentConfigQuery?.isLoading) {
    return (
      <Stack
        sx={{
          width: '100vw',
          height: '100vh',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Stack gap={3} sx={{ justifyContent: 'center', alignItems: 'center' }}>
          <CircularProgress color="neutral" />
          <a
            href="https://chaindesk.ai"
            target="_blank"
            style={{
              textDecoration: 'none',
            }}
          >
            <Box>
              <Typography level="body2">
                Powered by{' '}
                <Typography color="primary" fontWeight={'bold'}>
                  Chaindesk
                </Typography>
              </Typography>
            </Box>
          </a>
        </Stack>
      </Stack>
    );
  }

  return (
    <>
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Pacifico&display=swap"
          rel="stylesheet"
        />
      </Head>

      <Stack
        direction={{
          xs: 'column',
          sm: 'row',
        }}
        sx={{ height: '100vh', width: '100vw' }}
      >
        <Stack
          sx={{
            position: 'relative',
            p: {
              xs: 2,
              sm: 4,
            },
            maxWidth: '100%',
            minWidth: 300,
            backgroundColor: primaryColor || '#000',
            alignItems: {
              sm: 'center',
            },
          }}
        >
          <Stack
            gap={2}
            sx={{
              justifyContent: {
                sm: 'center',
              },
              alignItems: 'center',
            }}
            direction={{
              xs: 'row',
              sm: 'column',
            }}
            zIndex={3}
          >
            <Avatar
              alt={agent?.name}
              src={agent?.iconUrl || '/app-rounded-bg-white.png'}
              sx={{
                boxShadow: 'sm',
                width: {
                  xs: 34,
                  sm: 54,
                },
                height: {
                  xs: 34,
                  sm: 54,
                },
              }}
            />
            <Typography
              level="h5"
              fontWeight={'bold'}
              sx={{
                color: textColor,
                // fontFamily: 'Pacifico',
              }}
            >
              {agent?.name}
            </Typography>
          </Stack>

          <div
            id="bg-wrap"
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              zIndex: 2,
              width: '100%',
              height: '100%',
              overflow: 'visible',
            }}
          >
            <svg
              style={{ width: '100%', height: '100%' }}
              viewBox="0 0 100 100"
              preserveAspectRatio="xMidYMid slice"
            >
              <defs>
                <radialGradient
                  id="Gradient1"
                  cx="50%"
                  cy="50%"
                  fx="0.441602%"
                  fy="50%"
                  r=".5"
                >
                  <animate
                    attributeName="fx"
                    dur="34s"
                    values="0%;3%;0%"
                    repeatCount="indefinite"
                  ></animate>
                  <stop offset="0%" stopColor="rgba(255, 0, 255, 1)"></stop>
                  <stop offset="100%" stopColor="rgba(255, 0, 255, 0)"></stop>
                </radialGradient>
                <radialGradient
                  id="Gradient2"
                  cx="50%"
                  cy="50%"
                  fx="2.68147%"
                  fy="50%"
                  r=".5"
                >
                  <animate
                    attributeName="fx"
                    dur="23.5s"
                    values="0%;3%;0%"
                    repeatCount="indefinite"
                  ></animate>
                  <stop offset="0%" stopColor="rgba(255, 255, 0, 1)"></stop>
                  <stop offset="100%" stopColor="rgba(255, 255, 0, 0)"></stop>
                </radialGradient>
                <radialGradient
                  id="Gradient3"
                  cx="50%"
                  cy="50%"
                  fx="0.836536%"
                  fy="50%"
                  r=".5"
                >
                  <animate
                    attributeName="fx"
                    dur="21.5s"
                    values="0%;3%;0%"
                    repeatCount="indefinite"
                  ></animate>
                  <stop offset="0%" stopColor="rgba(0, 255, 255, 1)"></stop>
                  <stop offset="100%" stopColor="rgba(0, 255, 255, 0)"></stop>
                </radialGradient>
                <radialGradient
                  id="Gradient4"
                  cx="50%"
                  cy="50%"
                  fx="4.56417%"
                  fy="50%"
                  r=".5"
                >
                  <animate
                    attributeName="fx"
                    dur="23s"
                    values="0%;5%;0%"
                    repeatCount="indefinite"
                  ></animate>
                  <stop offset="0%" stopColor="rgba(0, 255, 0, 1)"></stop>
                  <stop offset="100%" stopColor="rgba(0, 255, 0, 0)"></stop>
                </radialGradient>
                <radialGradient
                  id="Gradient5"
                  cx="50%"
                  cy="50%"
                  fx="2.65405%"
                  fy="50%"
                  r=".5"
                >
                  <animate
                    attributeName="fx"
                    dur="24.5s"
                    values="0%;5%;0%"
                    repeatCount="indefinite"
                  ></animate>
                  <stop offset="0%" stopColor="rgba(0,0,255, 1)"></stop>
                  <stop offset="100%" stopColor="rgba(0,0,255, 0)"></stop>
                </radialGradient>
                <radialGradient
                  id="Gradient6"
                  cx="50%"
                  cy="50%"
                  fx="0.981338%"
                  fy="50%"
                  r=".5"
                >
                  <animate
                    attributeName="fx"
                    dur="25.5s"
                    values="0%;5%;0%"
                    repeatCount="indefinite"
                  ></animate>
                  <stop offset="0%" stopColor="rgba(255,0,0, 1)"></stop>
                  <stop offset="100%" stopColor="rgba(255,0,0, 0)"></stop>
                </radialGradient>
              </defs>
              {/* <!--<rect x="0" y="0" width="100%" height="100%" fill="url(#Gradient4)">
	<animate attributeName="x" dur="20s" values="25%;0%;25%" repeatCount="indefinite" />
	<animate attributeName="y" dur="21s" values="0%;25%;0%" repeatCount="indefinite" />
	<animateTransform attributeName="transform" type="rotate" from="0 50 50" to="360 50 50" dur="17s" repeatCount="indefinite"/>
	</rect>
	<rect x="0" y="0" width="100%" height="100%" fill="url(#Gradient5)">
	<animate attributeName="x" dur="23s" values="0%;-25%;0%" repeatCount="indefinite" />
	<animate attributeName="y" dur="24s" values="25%;-25%;25%" repeatCount="indefinite" />
	<animateTransform attributeName="transform" type="rotate" from="0 50 50" to="360 50 50" dur="18s" repeatCount="indefinite"/>
	</rect>
	<rect x="0" y="0" width="100%" height="100%" fill="url(#Gradient6)">
	<animate attributeName="x" dur="25s" values="-25%;0%;-25%" repeatCount="indefinite" />
	<animate attributeName="y" dur="26s" values="0%;-25%;0%" repeatCount="indefinite" />
	<animateTransform attributeName="transform" type="rotate" from="360 50 50" to="0 50 50" dur="19s" repeatCount="indefinite"/>
	</rect>--> */}
              <rect
                x="13.744%"
                y="1.18473%"
                width="100%"
                height="100%"
                fill="url(#Gradient1)"
                transform="rotate(334.41 50 50)"
              >
                <animate
                  attributeName="x"
                  dur="20s"
                  values="25%;0%;25%"
                  repeatCount="indefinite"
                ></animate>
                <animate
                  attributeName="y"
                  dur="21s"
                  values="0%;25%;0%"
                  repeatCount="indefinite"
                ></animate>
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  from="0 50 50"
                  to="360 50 50"
                  dur="7s"
                  repeatCount="indefinite"
                ></animateTransform>
              </rect>
              <rect
                x="-2.17916%"
                y="35.4267%"
                width="100%"
                height="100%"
                fill="url(#Gradient2)"
                transform="rotate(255.072 50 50)"
              >
                <animate
                  attributeName="x"
                  dur="23s"
                  values="-25%;0%;-25%"
                  repeatCount="indefinite"
                ></animate>
                <animate
                  attributeName="y"
                  dur="24s"
                  values="0%;50%;0%"
                  repeatCount="indefinite"
                ></animate>
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  from="0 50 50"
                  to="360 50 50"
                  dur="12s"
                  repeatCount="indefinite"
                ></animateTransform>
              </rect>
              <rect
                x="9.00483%"
                y="14.5733%"
                width="100%"
                height="100%"
                fill="url(#Gradient3)"
                transform="rotate(139.903 50 50)"
              >
                <animate
                  attributeName="x"
                  dur="25s"
                  values="0%;25%;0%"
                  repeatCount="indefinite"
                ></animate>
                <animate
                  attributeName="y"
                  dur="12s"
                  values="0%;25%;0%"
                  repeatCount="indefinite"
                ></animate>
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  from="360 50 50"
                  to="0 50 50"
                  dur="9s"
                  repeatCount="indefinite"
                ></animateTransform>
              </rect>
            </svg>
          </div>
        </Stack>
        <Stack
          sx={{
            width: '100%',
            height: '100%',
          }}
        >
          <iframe
            style={{
              width: '100%',
              height: '100%',
            }}
            src={`/agents/${agentId}/iframe?primaryColor="#ffffff"`}
            frameBorder="0"
          />
        </Stack>
      </Stack>
    </>
  );
}

App.getLayout = function getLayout(page: ReactElement) {
  return page;
};

export default App;
