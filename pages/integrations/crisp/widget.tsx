import {
  Alert,
  Box,
  Button,
  Card,
  Divider,
  FormControl,
  FormLabel,
  Input,
  Stack,
} from '@mui/joy';
import axios from 'axios';
import { GetServerSidePropsContext } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState } from 'react';

import Logo from '@app/components/Logo';
import { getConnectedWebsites } from '@app/utils/crisp';
import prisma from '@app/utils/prisma-client';

// query params website_id=5678ba03-6008-4fe3-aeef-aa78466c0bbc&session_id=session_f55e6731-51a4-4815-a1e3-655db78bb358&token=xxx&locale=en

export default function CrispConfig(props: { isPremium?: boolean }) {
  const [isLoading, setIsLoading] = useState(false);
  // const [inputValue, setInputValue] = useState(props.apiKey);
  const [submitError, setSubmitError] = useState('');
  const router = useRouter();

  // const sendConfig = async (e: any) => {
  //   e.stopPropagation();
  //   try {
  //     setIsLoading(true);
  //     setSubmitError('');

  //     var _urlParams = new URLSearchParams(window.location.search);
  //     const _message = inputValue;

  //     fetch(window.location.origin + '/api/crisp/config-update', {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify({
  //         website_id: _urlParams.get('website_id'),
  //         token: _urlParams.get('token'),
  //         chaindeskApiKey: _message,
  //       }),
  //     }).then(() => {
  //       console.log('worked');
  //       alert('Settings saved! You can now close this window.');
  //     });
  //   } catch (error) {
  //     console.log(error);
  //     setSubmitError(JSON.stringify(error));
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };
  const handleSummarize = async () => {
    setIsLoading(true);
    await axios.post('/api/crisp/widget', {
      website_id: router.query.website_id,
      session_id: router.query.session_id,
      token: router.query.token,
      locale: router.query.locale,
    });
    setIsLoading(false);
  };

  return (
    <>
      <Head>
        <title>Chaindesk - Crisp Widget</title>
        <meta
          name="description"
          content="Chaindesk is the leading document retrievial platform"
        />
      </Head>
      <Box
        p={0}
        className="flex flex-col items-center justify-start w-screen h-screen overflow-y-auto bg-black"
      >
        {props.isPremium ? (
          <Stack className="w-full mx-auto">
            {submitError && <Alert color="danger">{submitError}</Alert>}

            <Card>
              <form className="flex">
                <Stack direction={'column'} spacing={1} width={'100%'}>
                  <Button
                    loading={isLoading}
                    className="w-full max-w-xs mx-auto"
                    size="sm"
                    onClick={handleSummarize}
                  >
                    ✨ Summarize
                  </Button>
                </Stack>
              </form>
            </Card>
          </Stack>
        ) : (
          <Alert color="warning" sx={{ m: 2 }}>
            This feature is restricted to Chaindesk.ai premium users
          </Alert>
        )}
      </Box>
    </>
  );
}

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const websiteId = ctx.query.website_id as string;
  const token = ctx.query.token as string;
  const redirect = {
    redirect: {
      destination: '/',
      permanent: false,
    },
  };
  if (!websiteId || !token) {
    return redirect;
  }
  // const websites = await getConnectedWebsites();
  // if (token === websites[websiteId]?.token) {
  const integration = await prisma.externalIntegration.findUnique({
    where: {
      integrationId: websiteId,
    },
    include: {
      agent: {
        include: {
          owner: {
            include: {
              subscriptions: {
                where: {
                  status: 'active',
                },
              },
              apiKeys: true,
            },
          },
        },
      },
    },
  });

  return {
    props: {
      isPremium: (integration?.agent?.owner?.subscriptions?.length || 0) > 0,
    },
  };
  // }

  return { props: {} };
};
