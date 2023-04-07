import { zodResolver } from '@hookform/resolvers/zod';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import {
  Alert,
  Box,
  Button,
  Card,
  CardOverflow,
  CircularProgress,
  Divider,
  IconButton,
  Input,
  Link as JoyLink,
  Option,
  Select,
  Sheet,
  Stack,
  Typography,
} from '@mui/joy';
import { Prisma } from '@prisma/client';
import axios from 'axios';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { GetServerSidePropsContext } from 'next/types';
import { useSession } from 'next-auth/react';
import { ReactElement } from 'react';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import useSWR from 'swr';
import { z } from 'zod';

import Layout from '@app/components/Layout';
import useStateReducer from '@app/hooks/useStateReducer';
import { RouteNames } from '@app/types';
import { fetcher } from '@app/utils/swr-fetcher';
import { withAuth } from '@app/utils/withAuth';

const Schema = z.object({ query: z.string().min(1) });

export default function DatasourcesPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  console.log('isPremium', session?.user);

  return (
    <Box
      component="main"
      className="MainContent"
      sx={(theme) => ({
        px: {
          xs: 2,
          md: 6,
        },
        pt: {
          // xs: `calc(${theme.spacing(2)} + var(--Header-height))`,
          // sm: `calc(${theme.spacing(2)} + var(--Header-height))`,
          // md: 3,
        },
        pb: {
          xs: 2,
          sm: 2,
          md: 3,
        },
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
        // height: '100dvh',
        width: '100%',
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
          Apps
        </Typography>
      </Box>

      <Divider sx={{ mt: 2 }} />

      <Card variant="outlined" className="max-w-sm p-0 mt-8 overflow-hidden">
        <Box className="relative w-full px-2 py-12 text-center">
          <Typography
            level="h2"
            fontWeight={'bold'}
            className="relative z-10 block"
            sx={(theme) => theme.typography.display1}
          >
            Chat Site
          </Typography>

          <Typography>ChatGPT Bot trained on website data</Typography>

          <Stack direction={'column'} gap={1} mt={4}>
            <Typography level={'body2'}>Integrated via</Typography>
            <Link target="_blank" href={'https://crisp.chat/'}>
              <Image
                className="w-32 mx-auto "
                src="https://upload.wikimedia.org/wikipedia/commons/0/0b/Logo_de_Crisp.svg"
                width={20}
                height={20}
                alt="crisp logo"
              ></Image>
            </Link>
          </Stack>
        </Box>

        <Divider />

        <Stack
          p={4}
          sx={{
            with: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
          gap={2}
        >
          {session?.user?.isPremium ? (
            <Link
              target="_blank"
              href={`https://blog.databerry.ai/chat-site`}
              className="w-full"
            >
              <Button
                endDecorator={<ArrowForwardRoundedIcon />}
                variant="outlined"
                sx={{ width: '100%' }}
              >
                Settings
              </Button>
            </Link>
          ) : (
            <Link
              href={`${process.env
                .NEXT_PUBLIC_STRIPE_PAYMENT_LINK_LEVEL_1!}?client_reference_id=${
                session?.user?.id
              }`}
              className="w-full"
            >
              <Button
                endDecorator={<ArrowForwardRoundedIcon />}
                variant="outlined"
                sx={{ width: '100%' }}
              >
                Subscribe
              </Button>
            </Link>
          )}

          <Link href={RouteNames.CHAT_SITE}>
            <Typography level="body2" color="neutral">
              More info
            </Typography>
          </Link>
        </Stack>
      </Card>
      {/* <Card variant="outlined" className="max-w-sm p-0 mt-8 overflow-hidden">
        <Box className="relative w-full px-2 py-12 text-center">
          <Typography
            level="h2"
            fontWeight={'bold'}
            className="relative z-10 block"
            sx={(theme) => theme.typography.display1}
          >
            Slack Bot
          </Typography>

          <Typography>ChatGPT Bot trained on website data</Typography>

          <Stack direction={'column'} gap={1} mt={4}>
            <Typography level={'body2'}>Integrated via</Typography>
            <Link target="_blank" href={'https://crisp.chat/'}>
              <Image
                className="w-32 mx-auto "
                src="https://upload.wikimedia.org/wikipedia/commons/0/0b/Logo_de_Crisp.svg"
                width={20}
                height={20}
                alt="crisp logo"
              ></Image>
            </Link>
          </Stack>
        </Box>

        <Divider />

        <Stack
          p={4}
          sx={{
            with: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
          gap={2}
        >
          {session?.user?.isPremium ? (
            <Link
              target="_blank"
              href={`https://slack.com/oauth/v2/authorize?client_id=${
                process.env.NEXT_PUBLIC_SLACK_CLIENT_ID
              }&scope=app_mentions:read,channels:history,chat:write,commands,users:read&redirect_uri=${
                // process.env.NEXT_PUBLIC_DASHBOARD_URL
                `https://49b1-195-68-57-166.eu.ngrok.io`
              }/api/slack/auth-callback`}
              className="w-full"
            >
              <Button
                endDecorator={<ArrowForwardRoundedIcon />}
                variant="outlined"
                sx={{ width: '100%' }}
              >
                Settings
              </Button>
            </Link>
          ) : (
            <Link
              href={`${process.env
                .NEXT_PUBLIC_STRIPE_PAYMENT_LINK_LEVEL_1!}?client_reference_id=${
                session?.user?.id
              }`}
              className="w-full"
            >
              <Button
                endDecorator={<ArrowForwardRoundedIcon />}
                variant="outlined"
                sx={{ width: '100%' }}
              >
                Subscribe
              </Button>
            </Link>
          )}

          <Link href={RouteNames.CHAT_SITE}>
            <Typography level="body2" color="neutral">
              More info
            </Typography>
          </Link>
        </Stack>
      </Card> */}
    </Box>
  );
}

DatasourcesPage.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};

export const getServerSideProps = withAuth(
  async (ctx: GetServerSidePropsContext) => {
    return {
      props: {},
    };
  }
);
