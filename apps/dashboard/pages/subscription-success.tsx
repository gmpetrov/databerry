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

import { AnalyticsContext } from '@app/components/Analytics';
import useConfetti from '@app/hooks/useConfetti';

import { RouteNames } from '@chaindesk/lib/types';
import { withAuth } from '@chaindesk/lib/withAuth';

export default function SubscriptionSuccessPage() {
  const router = useRouter();
  const { capture } = React.useContext(AnalyticsContext);
  const triggerConfetti = useConfetti();

  React.useEffect(() => {
    triggerConfetti();
  }, []);

  React.useEffect(() => {
    function getClientReferenceId() {
      return (
        ((window as any)?.Rewardful && (window as any)?.Rewardful?.referral) ||
        'checkout_' + new Date().getTime()
      );
    }

    (async () => {
      const checkoutSessionId = router.query?.checkout_session_id;

      if (!checkoutSessionId) {
        return;
      }

      try {
        const checkoutDataRes = await axios.post(
          '/api/stripe/get-checkout-session',
          {
            checkoutSessionId,
          }
        );

        const checkoutData = checkoutDataRes.data;

        if (checkoutData) {
          console.debug(checkoutData);

          capture?.({
            event: 'purchase',
            payload: {
              transaction_id: checkoutData.id,
              value: checkoutData.amount_total,
              currency: checkoutData.currency / 100,
            },
          });
        }
      } catch (err) {
        console.log(err);
      }

      let utmParams = {};
      try {
        utmParams = JSON.parse(Cookies.get('utmParams') || '{}');
      } catch {}

      await axios
        .post('/api/stripe/referral', {
          checkoutSessionId,
          referralId: getClientReferenceId(),
          utmParams,
        })
        .catch(console.log);

      delete router.query.checkout_session_id;
      router.replace(router, undefined, { shallow: true });
    })();
  }, []);

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
                <Typography level="body-md">
                  Thank your for your payment! Your account has been
                  successfully upgraded
                </Typography>
              </Stack>
            </Stack>

            <Link href={RouteNames.BILLING}>
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
