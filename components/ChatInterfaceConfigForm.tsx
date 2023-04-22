import createCache from '@emotion/cache';
import { CacheProvider, ThemeProvider } from '@emotion/react';
import { zodResolver } from '@hookform/resolvers/zod';
import Alert from '@mui/joy/Alert';
import Box from '@mui/joy/Box';
import Button from '@mui/joy/Button';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import Input from '@mui/joy/Input';
import Radio from '@mui/joy/Radio';
import RadioGroup from '@mui/joy/RadioGroup';
import Stack from '@mui/joy/Stack';
import { StyledEngineProvider } from '@mui/joy/styles';
import Textarea from '@mui/joy/Textarea';
import Typography from '@mui/joy/Typography';
import { Prisma } from '@prisma/client';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import Frame, { FrameContextConsumer } from 'react-frame-component';
import { Controller, useForm } from 'react-hook-form';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import html from 'react-syntax-highlighter/dist/esm/languages/hljs/htmlbars';
import docco from 'react-syntax-highlighter/dist/esm/styles/hljs/vs2015';
import useSWR from 'swr';

import { getAgent } from '@app/pages/api/agents/[id]';
import { AgentInterfaceConfig } from '@app/types/models';
import { fetcher } from '@app/utils/swr-fetcher';

import ChatBubble, { theme } from './ChatBubble';

if (typeof window !== 'undefined') {
  SyntaxHighlighter.registerLanguage('htmlbars', html);
}

type Props = {
  agentId: string;
};

// const memoizedCreateCacheWithContainer = weakMemoize((container: any) => {
//   let newCache = createCache({ container, key: 'css' });
//   return newCache;
// });

function ChatInterfaceConfigForm({ agentId }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const getAgentQuery = useSWR<Prisma.PromiseReturnType<typeof getAgent>>(
    `/api/agents/${agentId}`,
    fetcher
  );

  const methods = useForm<AgentInterfaceConfig>({
    resolver: zodResolver(AgentInterfaceConfig),
  });

  const onSubmit = async (values: AgentInterfaceConfig) => {
    try {
      setIsLoading(true);

      console.log('values', values);

      await axios.post('/api/agents', {
        ...getAgentQuery?.data,
        interfaceConfig: values,
      });

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

  console.log('errors', methods.formState.errors);

  const values = methods.watch();

  return (
    <form onSubmit={methods.handleSubmit(onSubmit)}>
      <Stack gap={3}>
        <FormControl>
          <FormLabel>Authorized Domains</FormLabel>

          <Alert sx={{ mb: 1 }}>
            Domains where the chat widget will be added for security purposes.
            e.g: example.com
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

        <FormControl>
          <FormLabel>Display Name</FormLabel>
          <Input {...methods.register('displayName')} />
        </FormControl>

        <FormControl>
          <FormLabel>Initial Message</FormLabel>
          <Input {...methods.register('initialMessage')} />
        </FormControl>

        <FormControl>
          <FormLabel>Message Templates</FormLabel>

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

        <FormControl>
          <FormLabel>Position</FormLabel>
          <Controller
            control={methods.control}
            name="position"
            defaultValue={
              (getAgentQuery as any).data?.interfaceConfig?.position
            }
            render={({ field }) => (
              <RadioGroup {...field}>
                <Radio value="left" label="Left" variant="plain" />
                <Radio value="right" label="Right" variant="plain" />
              </RadioGroup>
            )}
          />
        </FormControl>

        <FormControl>
          <FormLabel>Brand Color</FormLabel>
          <Input placeholder="#000000" {...methods.register('primaryColor')} />
        </FormControl>

        {getAgentQuery?.data?.id && (
          <Frame
            style={{
              width: '100%',
              height: 900,
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
                        <Box
                          sx={{
                            width: '100vw',
                            height: '100vh',
                            maxHeight: '100%',
                            overflow: 'hidden',
                          }}
                        >
                          {/* <CssBaseline enableColorScheme /> */}
                          <ChatBubble
                            agentId={getAgentQuery?.data?.id!}
                            initConfig={values}
                          />
                        </Box>
                      </ThemeProvider>
                    </CacheProvider>
                  </StyledEngineProvider>
                );
              }}
            </FrameContextConsumer>
          </Frame>
        )}

        <Stack gap={1}>
          <Typography level="h6">
            Embed Agent on your website section
          </Typography>
          <Typography level="body2">
            To Embed the Agent on your website paste this code to the HTML Head
            section
          </Typography>
        </Stack>

        <SyntaxHighlighter
          language="htmlbars"
          style={docco}
          customStyle={{
            borderRadius: 10,
          }}
        >
          {`<script 
  id="${getAgentQuery?.data?.id}}"
  data-name="databerry-chat-bubble"
  src="https://cdn.jsdelivr.net/npm/@databerry/chat-bubble@latest"
/>`}
        </SyntaxHighlighter>

        <Button type="submit" loading={isLoading} sx={{ ml: 'auto', mt: 2 }}>
          Update
        </Button>
      </Stack>
    </form>
  );
}

export default ChatInterfaceConfigForm;
