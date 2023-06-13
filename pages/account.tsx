import AddIcon from '@mui/icons-material/Add';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import DeleteIcon from '@mui/icons-material/Delete';
import HelpOutlineRoundedIcon from '@mui/icons-material/HelpOutlineRounded';
import LinkRoundedIcon from '@mui/icons-material/LinkRounded';
import Alert from '@mui/joy/Alert';
import Box from '@mui/joy/Box';
import Button from '@mui/joy/Button';
import Card from '@mui/joy/Card';
import Divider from '@mui/joy/Divider';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import IconButton from '@mui/joy/IconButton';
import Stack from '@mui/joy/Stack';
import Typography from '@mui/joy/Typography';
import { Prisma, SubscriptionPlan } from '@prisma/client';
import axios from 'axios';
import Cookies from 'js-cookie';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { GetServerSidePropsContext } from 'next/types';
import { useSession } from 'next-auth/react';
import { ReactElement } from 'react';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import useSWR from 'swr';
import { z } from 'zod';

import Layout from '@app/components/Layout';
import UserFree from '@app/components/UserFree';
import UserPremium from '@app/components/UserPremium';
import useStateReducer from '@app/hooks/useStateReducer';
import accountConfig from '@app/utils/account-config';
import { fetcher } from '@app/utils/swr-fetcher';
import { withAuth } from '@app/utils/withAuth';

import { getApiKeys } from './api/accounts/api-keys';

export default function AccountPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [state, setState] = useStateReducer({
    isLoadingCreateApiKey: false,
    isLoadingDeleteApiKey: false,
  });

  const getApiKeysQuery = useSWR<Prisma.PromiseReturnType<typeof getApiKeys>>(
    '/api/accounts/api-keys',
    fetcher,
    {
      refreshInterval: 5000,
    }
  );

  const handleClickManageSubscription = async () => {
    try {
      const { data } = await axios.post('/api/stripe/customer-portal');

      if (data) {
        router.push(data);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleCreatApiKey = async () => {
    try {
      setState({
        isLoadingCreateApiKey: true,
      });

      await axios.post(`/api/accounts/api-keys`);

      getApiKeysQuery.mutate();
    } catch (err) {
      console.log(err);
    } finally {
      setState({
        isLoadingCreateApiKey: false,
      });
    }
  };

  const handleDeleteApiKey = async (id: string) => {
    try {
      if (getApiKeysQuery?.data?.length === 1) {
        return alert('You must have at least one api key');
      }

      if (window.confirm('Are you sure you want to delete this api key?')) {
        setState({
          isLoadingDeleteApiKey: true,
        });

        await axios.delete(`/api/accounts/api-keys`, {
          data: {
            apiKeyId: id,
          },
        });

        getApiKeysQuery.mutate();
      }
    } catch (err) {
      const message = (err as any)?.response?.data?.error || err;
      console.log(message);
      alert(message);
    } finally {
      setState({
        isLoadingDeleteApiKey: false,
      });
    }
  };

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

  const currentPlan = accountConfig[session?.user?.currentPlan!];

  if (!session?.user) {
    return null;
  }

  return (
    <Box
      component="main"
      className="MainContent"
      sx={(theme) => ({
        position: 'relative',
        width: '100%',
        height: '100%',
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
      })}
    >
      <Head>
        <script
          id="stripe-pricing-table"
          async
          src="https://js.stripe.com/v3/pricing-table.js"
        ></script>
      </Head>

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
          Account
        </Typography>
      </Box>

      <Stack direction={'row'} gap={2}>
        <Link href={`#plan`}>
          <Button
            size="sm"
            variant="plain"
            startDecorator={<LinkRoundedIcon />}
          >
            Subscription
          </Button>
        </Link>
        <Link href={`#api-keys`}>
          <Button
            size="sm"
            variant="plain"
            startDecorator={<LinkRoundedIcon />}
          >
            API Keys
          </Button>
        </Link>
      </Stack>

      <Divider sx={{ mt: 2, mb: 4 }} />

      <Box mb={4}>
        <UserFree>
          <Card variant="outlined" sx={{ bgcolor: 'black' }}>
            <stripe-pricing-table
              pricing-table-id={process.env.NEXT_PUBLIC_STRIPE_PRICING_TABLE_ID}
              publishable-key={process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY}
              client-reference-id={session?.user?.id}
              customer-email={session?.user?.email}
            ></stripe-pricing-table>
          </Card>
        </UserFree>
      </Box>

      <Stack
        gap={4}
        sx={(theme) => ({
          maxWidth: '100%',
          width: theme.breakpoints.values.md,
          mx: 'auto',
        })}
      >
        <FormControl id="plan" sx={{ gap: 1 }}>
          <FormLabel>Current Plan</FormLabel>
          {/* <Typography level="body3">
            Use the api key to access the Databerry API
          </Typography> */}

          <Card variant="outlined">
            <Typography
              level="h4"
              fontWeight={'bold'}
              color={
                currentPlan?.type === SubscriptionPlan?.level_0
                  ? 'warning'
                  : 'success'
              }
            >{`${currentPlan?.label}`}</Typography>

            <Stack width="100%" spacing={2} my={2}>
              <Stack spacing={1}>
                <Typography level="body1">Current Usage</Typography>
                <Typography level="h6">
                  <Stack direction={'row'} spacing={1}>
                    <Typography color="neutral">Agents Responses:</Typography>
                    <Typography
                      color={
                        session?.user?.usage?.nbAgentQueries >=
                        currentPlan?.limits?.maxAgentsQueries
                          ? 'danger'
                          : 'success'
                      }
                    >
                      {`${session?.user?.usage?.nbAgentQueries}/${currentPlan?.limits?.maxAgentsQueries}`}
                    </Typography>
                  </Stack>
                </Typography>
                {/* <Typography level="h6">
                  <Stack direction={'row'} spacing={1}>
                    <Typography color="neutral">Datastores:</Typography>
                    <Typography
                      color={
                        session?.user?.nbDatastores >=
                        currentPlan?.limits?.maxDatastores
                          ? 'danger'
                          : 'success'
                      }
                    >
                      {`${session?.user?.nbDatastores}/${currentPlan?.limits?.maxDatastores}`}
                    </Typography>
                  </Stack>
                </Typography> */}
                <Typography level="h6">
                  <Stack direction={'row'} spacing={1}>
                    <Typography color="neutral">Data Processing:</Typography>
                    <Typography
                      color={
                        session?.user?.usage?.nbDataProcessingBytes >=
                        currentPlan?.limits?.maxDataProcessing
                          ? 'danger'
                          : 'success'
                      }
                    >
                      {`${
                        session?.user?.usage?.nbDataProcessingBytes / 1000000
                      }/${currentPlan?.limits?.maxDataProcessing / 1000000}MB`}
                    </Typography>
                  </Stack>
                </Typography>
              </Stack>
              <Divider></Divider>
              <Typography
                level="h6"
                startDecorator={<CheckRoundedIcon color="success" />}
              >
                <Typography>{`${currentPlan?.limits?.maxAgents} Agents`}</Typography>
              </Typography>
              <Typography
                level="h6"
                startDecorator={<CheckRoundedIcon color="success" />}
              >
                <Typography>{`${currentPlan?.limits?.maxDatastores} Datastores`}</Typography>
              </Typography>
              <Typography
                level="h6"
                startDecorator={<CheckRoundedIcon color="success" />}
              >
                <Typography>{`${currentPlan?.limits?.maxAgentsQueries} Agent responses / month`}</Typography>
              </Typography>
              <Typography
                level="h6"
                startDecorator={<CheckRoundedIcon color="success" />}
              >
                <Typography>{`${
                  currentPlan?.limits?.maxFileSize / 1000000
                }MB File upload limit`}</Typography>
              </Typography>
              <Typography
                level="h6"
                startDecorator={<CheckRoundedIcon color="success" />}
              >
                <Typography>{`${
                  currentPlan?.limits?.maxDataProcessing / 1000000
                }MB Data processing (embeddings) / month`}</Typography>
              </Typography>
            </Stack>

            <Divider sx={{ my: 2 }} />

            {/* {currentPlan?.type === SubscriptionPlan?.level_0 && (
              <Link
                href={`${process.env
                  .NEXT_PUBLIC_STRIPE_PAYMENT_LINK_LEVEL_1!}?client_reference_id=${
                  session?.user?.id
                }&prefilled_email=${session?.user?.email}`}
                style={{ marginLeft: 'auto' }}
              >
                <Button
                  endDecorator={<ArrowForwardRoundedIcon />}
                  variant="solid"
                  color="warning"
                >
                  Subscribe
                </Button>
              </Link>
            )} */}

            <UserPremium>
              <Button
                onClick={handleClickManageSubscription}
                endDecorator={<ArrowForwardRoundedIcon />}
                variant="plain"
                sx={{ ml: 'auto' }}
              >
                Upgrade / Manage Subscription
              </Button>
            </UserPremium>
          </Card>
        </FormControl>

        <Divider sx={{ my: 4 }} />

        <Box id="api-keys">
          <FormControl sx={{ gap: 1 }}>
            <FormLabel>API Keys</FormLabel>

            <Typography level="body3">
              Use the api key to access the Databerry API
            </Typography>

            <Stack direction={'column'} gap={2} mt={2}>
              <Alert
                color="info"
                startDecorator={<HelpOutlineRoundedIcon />}
                endDecorator={
                  <Link href="https://docs.databerry.ai" target="_blank">
                    <Button
                      variant="plain"
                      size="sm"
                      endDecorator={<ArrowForwardRoundedIcon />}
                    >
                      Documentation
                    </Button>
                  </Link>
                }
              >
                Learn more about the Datatberry API
              </Alert>
              {getApiKeysQuery?.data?.map((each) => (
                <>
                  <Stack
                    key={each.id}
                    direction={'row'}
                    gap={2}
                    onClick={() => {
                      navigator.clipboard.writeText(each.key);
                      toast.success('Copied!', {
                        position: 'bottom-center',
                      });
                    }}
                  >
                    <Alert
                      color="neutral"
                      sx={{
                        width: '100%',
                        ':hover': {
                          cursor: 'copy',
                        },
                      }}
                    >
                      {each.key}
                    </Alert>

                    <IconButton
                      color="danger"
                      variant="outlined"
                      onClick={() => handleDeleteApiKey(each.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Stack>
                </>
              ))}
            </Stack>

            <Button
              startDecorator={<AddIcon />}
              sx={{ mt: 3, ml: 'auto' }}
              variant="outlined"
              onClick={handleCreatApiKey}
            >
              Create API Key
            </Button>
          </FormControl>
        </Box>
        {/* <Divider sx={{ my: 4 }} />

        <FormControl sx={{ gap: 1 }}>
          <FormLabel>Delete Datastore</FormLabel>
          <Typography level="body3">
            It will delete the datastore and all its datasources
          </Typography>
          <Button
            color="danger"
            sx={{ mr: 'auto', mt: 2 }}
            startDecorator={<DeleteIcon />}
            onClick={handleDeleteDatastore}
          >
            Delete
          </Button>
        </FormControl> */}
      </Stack>
    </Box>
  );
}

AccountPage.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};

export const getServerSideProps = withAuth(
  async (ctx: GetServerSidePropsContext) => {
    return {
      props: {},
    };
  }
);
