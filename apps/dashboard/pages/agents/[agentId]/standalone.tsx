import GitHubIcon from '@mui/icons-material/GitHub';
import InstagramIcon from '@mui/icons-material/Instagram';
import WebIcon from '@mui/icons-material/Language';
import TwitterIcon from '@mui/icons-material/Twitter';
import YoutubeIcon from '@mui/icons-material/YouTube';
import {
  Box,
  Card,
  CircularProgress,
  IconButton,
  Stack,
  Typography,
} from '@mui/joy';
import Avatar from '@mui/joy/Avatar';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { ReactElement, useEffect, useMemo } from 'react';
import superjson from 'superjson';
import useSWR from 'swr';

import ChatBoxLoader from '@app/components/ChatBoxLoader';
import { getAgent } from '@app/pages/api/agents/[id]';

import pickColorBasedOnBgColor from '@chaindesk/lib/pick-color-based-on-bgcolor';
import { fetcher } from '@chaindesk/lib/swr-fetcher';
import { AgentInterfaceConfig } from '@chaindesk/lib/types/models';
import { Agent, Prisma } from '@chaindesk/prisma';
import { prisma } from '@chaindesk/prisma/client';
import NewChatButton from '@chaindesk/ui/Chatbox/NewChatButton';
import useStateReducer from '@chaindesk/ui/hooks/useStateReducer';
import WidgetThemeProvider from '@chaindesk/ui/themes/embeds-provider';

export default function AgentPage() {
  const router = useRouter();
  const agentId = router?.query?.agentId as string;

  const [state, setState] = useStateReducer({
    isPageReady: false,
    agent: undefined as Agent | undefined,
    config: {},
  });

  const baseUrl = process.env.NEXT_PUBLIC_DASHBOARD_URL;
  const getAgentConfigQuery = useSWR<Prisma.PromiseReturnType<typeof getAgent>>(
    !!agentId ? `${baseUrl}/api/agents/${agentId}` : null,
    fetcher
  );

  const agent = getAgentConfigQuery?.data;
  const interfaceConfig = agent?.interfaceConfig as AgentInterfaceConfig;

  // const primaryColor = interfaceConfig?.primaryColor || '#ffffff';
  const primaryColor = '#ffffff';

  const textColor = useMemo(() => {
    return pickColorBasedOnBgColor(primaryColor, '#ffffff', '#000000');
  }, [primaryColor]);

  useEffect(() => {
    if (getAgentConfigQuery?.isLoading) {
      setTimeout(() => {
        setState({
          isPageReady: true,
        });
      }, 300);
    }
  }, [getAgentConfigQuery?.isLoading]);

  return (
    <>
      {/* <SEO
        title={`${props?.agent?.name} - made with Chaindesk`}
        description={props?.agent?.description}
        url={`https://chaindesk.ai/@${props?.agent?.handle}`}
      /> */}
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Pacifico&display=swap"
          rel="stylesheet"
        />
      </Head>

      {!agent || !state.isPageReady ? (
        <Stack
          sx={{
            width: '100vw',
            height: '100vh',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Stack
            gap={3}
            sx={{ justifyContent: 'center', alignItems: 'center' }}
          >
            <CircularProgress color="neutral" />
            <a
              href="https://chaindesk.ai"
              target="_blank"
              style={{
                textDecoration: 'none',
              }}
            >
              <Box>
                <Typography level="body-sm">
                  Powered by{' '}
                  <Typography color="primary" fontWeight={'bold'}>
                    Chaindesk
                  </Typography>
                </Typography>
              </Box>
            </a>
          </Stack>
        </Stack>
      ) : (
        <Stack
          direction={{
            xs: 'column',
            sm: 'row',
          }}
          sx={{
            width: '100vw',
            height: '100dvh',
            maxHeight: '100%',
            // maxHeight: '-webkit-fill-available',
            zIndex: 1000000000,
          }}
        >
          <Stack
            sx={{
              position: 'relative',
              // `display: {
              //   xs: 'none',
              //   sm: 'flex',
              // },`
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
              maxWidth={{
                xs: '100%',
                sm: 500,
              }}
              zIndex={3}
              // height={'100%'}
            >
              <Avatar
                alt={agent?.name}
                src={agent?.iconUrl || '/logo.png'}
                sx={{
                  bgcolor: 'white',
                  boxShadow: 'sm',
                  width: {
                    xs: 34,
                    // sm: 54,
                  },
                  height: {
                    xs: 34,
                    // sm: 54,
                  },
                }}
              />
              <Stack
                gap={0.5}
                display={'flex'}
                sx={{
                  textAlign: 'center',
                }}
              >
                <Typography
                  level="title-lg"
                  fontWeight={'bold'}
                  sx={{
                    color: textColor,
                    fontFamily: 'Bricolage Grotesque',
                  }}
                >
                  {agent?.name}
                </Typography>
                <Typography
                  level="body-sm"
                  color="neutral"
                  sx={{
                    color: textColor,
                    display: {
                      xs: 'none',
                      sm: 'block',
                    },
                    // fontFamily: 'Pacifico',
                  }}
                >
                  {agent?.description}
                </Typography>
              </Stack>

              <Stack
                direction="row"
                gap={1}
                sx={{
                  mt: {
                    xs: 'auto',
                    sm: 2,
                  },
                  ml: {
                    xs: 'auto',
                    sm: 0,
                  },
                }}
              >
                {interfaceConfig?.instagramURL && (
                  <a href={`${interfaceConfig?.instagramURL}`} target="_blank">
                    <IconButton size="sm" color="neutral" variant="soft">
                      <InstagramIcon />
                    </IconButton>
                  </a>
                )}
                {interfaceConfig?.tiktokURL && (
                  <a href={`${interfaceConfig?.tiktokURL}`} target="_blank">
                    <IconButton size="sm" color="neutral" variant="soft">
                      <img
                        style={{ width: '20px', height: '20px' }}
                        src="https://i.pinimg.com/originals/b6/c9/dd/b6c9dda4b3983c5ecba8cf867a01bc6f.png"
                        alt=""
                      />
                    </IconButton>
                  </a>
                )}
                {interfaceConfig?.twitterURL && (
                  <a href={`${interfaceConfig?.twitterURL}`} target="_blank">
                    <IconButton size="sm" color="neutral" variant="soft">
                      <TwitterIcon />
                    </IconButton>
                  </a>
                )}
                {interfaceConfig?.youtubeURL && (
                  <a href={`${interfaceConfig?.youtubeURL}`} target="_blank">
                    <IconButton size="sm" color="neutral" variant="soft">
                      <YoutubeIcon />
                    </IconButton>
                  </a>
                )}
                {interfaceConfig?.githubURL && (
                  <a href={`${interfaceConfig?.githubURL}`} target="_blank">
                    <IconButton size="sm" color="neutral" variant="soft">
                      <GitHubIcon />
                    </IconButton>
                  </a>
                )}
                {interfaceConfig?.websiteURL && (
                  <a href={`${interfaceConfig?.websiteURL}`} target="_blank">
                    <IconButton size="sm" color="neutral" variant="soft">
                      <WebIcon />
                    </IconButton>
                  </a>
                )}
              </Stack>
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
              overflow: 'hidden',
            }}
          >
            <ChatBoxLoader
              agentId={agent?.id}
              layout={(props: any) => {
                return (
                  <div className="flex w-full h-full px-4 pb-4">
                    <div className="absolute top-4 right-4">
                      <NewChatButton />
                    </div>

                    {props.children}
                  </div>
                );
              }}
            />

            {/* <iframe
              style={{
                width: '100%',
                height: '100%',
              }}
              src={`${baseUrl}/agents/${agent?.id}/iframe?primaryColor="#ffffff"`}
              frameBorder="0"
            /> */}
          </Stack>
        </Stack>
      )}
    </>
  );
}

AgentPage.getLayout = function getLayout(page: ReactElement) {
  return <WidgetThemeProvider prefix="standalone">{page}</WidgetThemeProvider>;
};

// export async function getStaticPaths() {
//   const all: string[] = [];

//   return {
//     paths: all.map((path) => {
//       return { params: { site: path } };
//     }),
//     fallback: 'blocking',
//   };
// }

// export async function getStaticProps({
// {
//   params: { agentId },
// }: {
//   params: {
//     agentId: string;
//   };
// })
// export async function getServerSideProps(context: any) {
//   const agentId = context.params.agentId as string;
//   let agent = null;

//   if (agentId.startsWith('@')) {
//     const handle = agentId.replace('@', '');

//     agent = await prisma.agent.findUnique({
//       where: {
//         handle,
//         visibility: 'public',
//       },
//     });
//   } else {
//     agent = await prisma.agent.findUnique({
//       where: {
//         id: agentId,
//         visibility: 'public',
//       },
//     });
//   }

//   if (!agent) {
//     return {
//       redirect: {
//         destination: `/`,
//       },
//     };
//   }

//   return {
//     props: {
//       agent: superjson.serialize(agent).json || null,
//     },
//     // revalidate: 10,
//   };
// }
