import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import CheckCircleTwoToneIcon from '@mui/icons-material/CheckCircleTwoTone';
import Box from '@mui/joy/Box';
import Button from '@mui/joy/Button';
import Card from '@mui/joy/Card';
import Stack from '@mui/joy/Stack';
import Typography from '@mui/joy/Typography';
import axios from 'axios';
import Cookies from 'js-cookie';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { GetServerSidePropsContext } from 'next/types';
import * as React from 'react';

import { RouteNames } from '@app/types';
import { withAuth } from '@app/utils/withAuth';

export default function SubscriptionSuccessPage() {
  const router = useRouter();

  return (
    <Box
      component="main"
      className="MainContent"
      sx={(theme) => ({
        position: 'relative',
        width: '100%',
        height: '100%',
        minHeight: '100vh',
        maxHeight: '100%',
        overflowY: 'auto',
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
        justifyContent: 'center',
      })}
    >
      {/* <Head></Head> */}

      <Stack
        gap={4}
        sx={(theme) => ({
          maxWidth: '100%',
          width: theme.breakpoints.values.md,
          mx: 'auto',
        })}
      >
        <Card color="neutral" variant="outlined">
          <Stack
            sx={{
              justifyContent: 'center',
              display: 'flex',
              alignItems: 'center',
              textAlign: 'center',
              py: 6,
            }}
            gap={6}
          >
            <Stack gap={3}>
              <Typography level="h1">
                <CheckCircleTwoToneIcon color="success" />
              </Typography>
              <Stack gap={1}>
                <Typography level="h3">Your payment is successful</Typography>
                <Typography level="body1">
                  Thank your for your payment! Your account has been
                  successfully upgraded
                </Typography>
              </Stack>
            </Stack>

            <Link href={RouteNames.ACCOUNT}>
              <Button
                endDecorator={<ArrowForwardRoundedIcon />}
                color="primary"
                variant="solid"
              >
                Go back to Home
              </Button>
            </Link>
          </Stack>
        </Card>
      </Stack>
    </Box>
  );
}

export const getServerSideProps = withAuth(
  async (ctx: GetServerSidePropsContext) => {
    return {
      props: {},
    };
  }
);
