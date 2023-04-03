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
import { GetServerSidePropsContext } from 'next';
import Head from 'next/head';
import { useState } from 'react';

import Logo from '@app/components/Logo';
import { getConnectedWebsites } from '@app/utils/crisp';
import prisma from '@app/utils/prisma-client';

export default function CrispConfig(props: { apiKey?: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const [inputValue, setInputValue] = useState(props.apiKey);
  const [submitError, setSubmitError] = useState('');

  const sendConfig = async (e: any) => {
    e.stopPropagation();
    try {
      setIsLoading(true);
      setSubmitError('');

      var _urlParams = new URLSearchParams(window.location.search);
      const _message = inputValue;

      fetch(window.location.origin + '/api/crisp/config-update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          website_id: _urlParams.get('website_id'),
          token: _urlParams.get('token'),
          databerryApiKey: _message,
        }),
      }).then(() => {
        console.log('worked');
        alert('Settings saved! You can now close this window.');
      });
    } catch (error) {
      console.log(error);
      setSubmitError(JSON.stringify(error));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Databerry - LLMs automation without code</title>
        <meta
          name="description"
          content="Most bookkeeping software is accurate, but hard to use. We make the opposite trade-off, and hope you don’t get audited."
        />
      </Head>
      {/* <Header /> */}
      <Box className="flex flex-col items-center justify-center w-screen h-screen p-4 overflow-y-auto bg-black">
        <Stack className="w-full max-w-sm mx-auto">
          {submitError && <Alert color="danger">{submitError}</Alert>}

          <Card variant="outlined">
            <Logo className="w-20 mx-auto mb-5" />
            <form className="flex flex-col">
              <FormControl>
                <FormLabel>Databerry API Key</FormLabel>
                <Input
                  defaultValue={props.apiKey}
                  placeholder="Your datastore API Key here"
                  onChange={(e) => setInputValue(e.currentTarget.value)}
                />
              </FormControl>

              <Divider className="my-8" />

              <Button
                loading={isLoading}
                className="ml-auto"
                size="md"
                onClick={sendConfig}
              >
                Save Settings
              </Button>
            </form>
          </Card>
        </Stack>
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

  const websites = await getConnectedWebsites();

  if (token === websites[websiteId]?.token) {
    const integration = await prisma.externalIntegration.findUnique({
      where: {
        integrationId: websiteId,
      },
      include: {
        apiKey: true,
      },
    });

    return {
      props: {
        apiKey: integration?.apiKey?.key || '',
      },
    };
  }

  return redirect;
};
