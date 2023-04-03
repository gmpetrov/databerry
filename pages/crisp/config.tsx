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
import Head from 'next/head';
import { useState } from 'react';

import Logo from '@app/components/Logo';

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [submitError, setSubmitError] = useState('');

  const sendConfig = (e: any) => {
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
