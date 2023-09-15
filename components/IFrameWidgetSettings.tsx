import createCache from '@emotion/cache';
import { CacheProvider, ThemeProvider } from '@emotion/react';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Alert,
  Box,
  Button,
  Card,
  Checkbox,
  CircularProgress,
  CssBaseline,
  Divider,
  FormControl,
  FormHelperText,
  FormLabel,
  IconButton,
  List,
  ListItem,
  Modal,
  Option,
  Select,
  Stack,
  Textarea,
  Typography,
} from '@mui/joy';
import Input from '@mui/joy/Input';
import Radio from '@mui/joy/Radio';
import RadioGroup from '@mui/joy/RadioGroup';
import { CssVarsProvider, StyledEngineProvider } from '@mui/joy/styles';
import { Prisma } from '@prisma/client';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import React, { useEffect, useState } from 'react';
import Frame, { FrameContextConsumer } from 'react-frame-component';
import { Controller, useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import html from 'react-syntax-highlighter/dist/esm/languages/hljs/htmlbars';
import docco from 'react-syntax-highlighter/dist/esm/styles/hljs/vs2015';
import useSWR from 'swr';
import { z } from 'zod';

import useStateReducer from '@app/hooks/useStateReducer';
import { getAgent } from '@app/pages/api/agents/[id]';
import { AgentInterfaceConfig } from '@app/types/models';
import { fetcher } from '@app/utils/swr-fetcher';

import ChatBoxFrame from './ChatBoxFrame';
import ChatBubble, { theme } from './ChatBubble';

if (typeof window !== 'undefined') {
  SyntaxHighlighter.registerLanguage('htmlbars', html);
}

type Props = {
  isOpen: boolean;
  handleCloseModal: () => any;
  agentId: string;
};

export default function BubbleWidgetSettings(props: Props) {
  const { data: session, status } = useSession();
  const [state, setState] = useStateReducer({});
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const getAgentQuery = useSWR<Prisma.PromiseReturnType<typeof getAgent>>(
    `/api/agents/${props.agentId}`,
    fetcher
  );

  const methods = useForm<AgentInterfaceConfig>({
    resolver: zodResolver(AgentInterfaceConfig),
  });

  const onSubmit = async (values: AgentInterfaceConfig) => {
    try {
      setIsLoading(true);

      console.log('values', values);

      await toast.promise(
        axios.post('/api/agents', {
          ...getAgentQuery?.data,
          interfaceConfig: values,
        }),
        {
          loading: 'Updating...',
          success: 'Updated!',
          error: 'Something went wrong',
        }
      );

      getAgentQuery.mutate();
    } catch (err) {
      console.log(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (getAgentQuery.data) {
      methods.reset(getAgentQuery.data.interfaceConfig as AgentInterfaceConfig);
    }
  }, [getAgentQuery.data]);

  const config = getAgentQuery?.data?.interfaceConfig as AgentInterfaceConfig;

  console.debug('errors', methods.formState.errors);

  const values = methods.watch();

  const installScript = `<iframe
  src="https://app.chaindesk.ai/agents/${getAgentQuery?.data?.id}/iframe"
  width="100%"
  height="100%"
  frameborder="0"
></iframe>

`;

  return (
    <Modal
      open={props.isOpen}
      onClose={props.handleCloseModal}
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        p: 2,
        height: '100vh',
      }}
    >
      <Card
        variant="outlined"
        sx={{
          width: '100%',
          maxWidth: 'lg',
          maxHeight: '100%',
          overflowY: 'auto',
          my: 2,
        }}
      >
        <Typography level="h4">IFrame Widget</Typography>
        <Typography color="neutral" level="h6">
          Settings
        </Typography>
        <Divider sx={{ my: 2 }}></Divider>

        <form onSubmit={methods.handleSubmit(onSubmit)}>
          <Stack gap={3}>
            <Alert color="warning">
              {'🚨 To use this feature Agent visibility "public" is required'}
            </Alert>

            <FormControl>
              <FormLabel>Authorized Domains</FormLabel>

              <Alert sx={{ mb: 1 }}>
                Restrict the chat widget to specific domains for security
                purposes. e.g: example.com
              </Alert>

              <Textarea
                placeholder={`example-1.com\nexample-2.com`}
                minRows={3}
                defaultValue={config?.authorizedDomains?.join('\n')}
                onChange={(e) => {
                  e.stopPropagation();

                  try {
                    const str = e.target.value;

                    const values = str.split('\n');
                    const domains = values
                      .map((each) => each.trim()?.replace(/https?:\/\//, ''))
                      .filter((each) => !!each)
                      .map((each) => {
                        let hostname = '';
                        try {
                          hostname = new URL(`http://${each}`).host;
                        } catch (err) {}

                        return hostname;
                      })
                      .filter((each) => each !== undefined);

                    methods.setValue('authorizedDomains', domains);
                  } catch (err) {
                    console.log('err', err);
                  }
                }}
              />
            </FormControl>

            <Stack direction="row" gap={2} width="100%">
              <Stack width="100%" gap={3}>
                <FormControl>
                  <FormLabel>Initial Message</FormLabel>
                  <Input
                    placeholder="👋 Hi, How can I help you?"
                    {...methods.register('initialMessage')}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Message Suggestions</FormLabel>

                  {/* <Alert sx={{ mb: 1 }}>
            Domains where the chat widget will be added for security purposes.
            e.g: example.com
          </Alert> */}

                  <Textarea
                    placeholder={`Pricing Plans\nHow to create a website?`}
                    minRows={3}
                    defaultValue={config?.messageTemplates?.join('\n')}
                    onChange={(e) => {
                      e.stopPropagation();

                      try {
                        const str = e.target.value;

                        const values = str.split('\n');
                        const domains = values
                          .map((each) => each.trim())
                          .filter((each) => !!each);

                        methods.setValue('messageTemplates', domains);
                      } catch (err) {
                        console.log('err', err);
                      }
                    }}
                  />
                </FormControl>

                <FormControl
                  error={!!methods?.formState?.errors?.primaryColor?.message}
                >
                  <FormLabel>Brand Color</FormLabel>
                  <Input
                    defaultValue={config?.primaryColor || '#000000'}
                    placeholder="#000000"
                    {...methods.register('primaryColor')}
                  />
                  {methods?.formState?.errors?.primaryColor?.message && (
                    <FormHelperText>
                      {methods?.formState?.errors?.primaryColor?.message}
                    </FormHelperText>
                  )}
                </FormControl>

                <FormControl>
                  <Checkbox
                    label="Transparent Background"
                    defaultChecked={
                      !!(getAgentQuery as any).data?.interfaceConfig
                        ?.isBgTransparent
                    }
                    {...methods.register('isBgTransparent')}
                  />
                </FormControl>

                <Button
                  type="submit"
                  loading={isLoading}
                  sx={{ ml: 'auto', mt: 2 }}
                >
                  Update
                </Button>
              </Stack>

              {getAgentQuery?.data?.id && (
                <Frame
                  style={{
                    width: '100%',
                    height: 600,
                    border: '1px solid rgba(0, 0, 0, 0.2)',
                    borderRadius: 20,
                  }}
                >
                  <FrameContextConsumer>
                    {({ document }) => {
                      const cache = createCache({
                        key: 'iframe',
                        container: document?.head,
                        prepend: true,
                        speedy: true,
                      });

                      return (
                        <StyledEngineProvider injectFirst>
                          <CacheProvider value={cache}>
                            <ThemeProvider theme={theme}>
                              <CssVarsProvider
                                theme={theme}
                                defaultMode="light"
                                modeStorageKey="chaindesk-chat-iframe"
                              >
                                <CssBaseline enableColorScheme />
                                <Box
                                  style={{ width: '100vw', height: '100vh' }}
                                  sx={{
                                    body: {
                                      padding: 0,
                                      margin: 0,
                                    },
                                  }}
                                >
                                  <ChatBoxFrame initConfig={values} />
                                </Box>
                              </CssVarsProvider>
                            </ThemeProvider>
                          </CacheProvider>
                        </StyledEngineProvider>
                      );
                    }}
                  </FrameContextConsumer>
                </Frame>
              )}
            </Stack>
          </Stack>
          <Stack id="embed" gap={2} mt={4} mb={2}>
            <Typography level="body2">
              To Embed the Agent as an iFrame on your website paste this code
              into an HTML page
            </Typography>

            <Box
              sx={{ cursor: 'copy' }}
              onClick={() => {
                navigator.clipboard.writeText(installScript);
                toast.success('Copied!', {
                  position: 'bottom-center',
                });
              }}
            >
              <SyntaxHighlighter
                language="htmlbars"
                style={docco}
                customStyle={{
                  borderRadius: 10,
                }}
              >
                {installScript}
              </SyntaxHighlighter>
            </Box>
          </Stack>
        </form>
      </Card>
    </Modal>
  );
}
