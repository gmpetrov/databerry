import createCache from '@emotion/cache';
import { CacheProvider, ThemeProvider } from '@emotion/react';
import {
  Alert,
  Box,
  Button,
  CssBaseline,
  FormControl,
  FormLabel,
  Stack,
  Typography,
} from '@mui/joy';
import Radio from '@mui/joy/Radio';
import RadioGroup from '@mui/joy/RadioGroup';
import { CssVarsProvider, StyledEngineProvider } from '@mui/joy/styles';
import React from 'react';
import Frame, { FrameContextConsumer } from 'react-frame-component';
import { Controller } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import html from 'react-syntax-highlighter/dist/esm/languages/hljs/htmlbars';
import docco from 'react-syntax-highlighter/dist/esm/styles/hljs/vs2015';

import { theme, themeKeys } from '@app/utils/themes/chat-bubble';

import { CreateAgentSchema } from '@chaindesk/lib/types/dtos';

import CommonInterfaceInput from './AgentInputs/CommonInterfaceInput';
import CustomCSSInput from './AgentInputs/CustomCSSInput';
import AgentForm from './AgentForm';
import ChatBubble from './ChatBubble';
import ConnectForm from './ConnectForm';
import ReactFrameStyleFix from './ReactFrameStyleFix';

if (typeof window !== 'undefined') {
  SyntaxHighlighter.registerLanguage('htmlbars', html);
}

type Props = {
  agentId: string;
};

export default function BubbleWidgetSettings(props: Props) {
  const installScript = `<script
    defer
    id="${props.agentId}"
    data-name="databerry-chat-bubble"
    src="https://cdn.jsdelivr.net/npm/@databerry/chat-bubble@latest"
  ></script>`;
  //   const installScript = `<script type="text/javascript">
  //   (function() {
  //     d = document;
  //     s = d.createElement('script');
  //     s.id = '${getAgentQuery?.data?.id}';
  //     s.setAttribute('data-name', 'databerry-chat-bubble');
  //     s.src = 'https://cdn.jsdelivr.net/npm/@databerry/chat-bubble@latest';
  //     s.async = 1;
  //     d.getElementsByTagName('head')[0].appendChild(s);
  //   })();
  // </script>`;

  return (
    <AgentForm
      agentId={props.agentId}
      formProps={{
        sx: {
          alignItems: 'center',
          width: '100%',
        },
      }}
    >
      {({ query, mutation }) => {
        return (
          <ConnectForm<CreateAgentSchema>>
            {({ watch, register, control, formState, setValue }) => {
              const config = watch('interfaceConfig');
              return (
                <>
                  <Stack gap={3} sx={{ width: '100%' }}>
                    <Alert color="warning">
                      {
                        '🚨 To use this feature Agent visibility "public" is required'
                      }
                    </Alert>

                    <Stack direction="row" gap={2} width="100%">
                      <Stack width="100%" gap={3}>
                        <CommonInterfaceInput />

                        <FormControl>
                          <FormLabel>Position</FormLabel>
                          <Controller
                            control={control}
                            name="interfaceConfig.position"
                            defaultValue={
                              (query as any).data?.interfaceConfig?.position
                            }
                            render={({ field }) => (
                              <RadioGroup {...field}>
                                <Radio
                                  value="left"
                                  label="Left"
                                  variant="soft"
                                />
                                <Radio
                                  value="right"
                                  label="Right"
                                  variant="soft"
                                />
                              </RadioGroup>
                            )}
                          />
                        </FormControl>

                        <Button
                          type="submit"
                          loading={mutation.isMutating}
                          sx={{ ml: 'auto', mt: 2 }}
                        >
                          Update
                        </Button>
                      </Stack>

                      <Stack
                        style={{
                          width: '100%',
                        }}
                        spacing={2}
                      >
                        {query?.data?.id && config && (
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
                                      <CssVarsProvider
                                        theme={theme}
                                        defaultMode="light"
                                        {...themeKeys}
                                      >
                                        <CssBaseline />

                                        <ReactFrameStyleFix />

                                        <Box
                                          sx={{
                                            width: '100vw',
                                            height: '100vh',
                                            maxHeight: '100%',
                                            overflow: 'hidden',
                                            p: 2,
                                          }}
                                        >
                                          <ChatBubble
                                            agentId={query?.data?.id!}
                                            initConfig={config}
                                          />
                                          {config?.customCSS && (
                                            <style
                                              dangerouslySetInnerHTML={{
                                                __html: config?.customCSS || '',
                                              }}
                                            ></style>
                                          )}
                                        </Box>
                                      </CssVarsProvider>
                                    </CacheProvider>
                                  </StyledEngineProvider>
                                );
                              }}
                            </FrameContextConsumer>
                          </Frame>
                        )}

                        <Stack>{<CustomCSSInput />}</Stack>
                      </Stack>
                    </Stack>

                    <Stack id="embed" gap={2} mb={2}>
                      <Typography level="body-sm">
                        To Embed the Agent as a Chat Bubble on your website
                        paste this code to the HTML Head section
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
                  </Stack>
                </>
              );
            }}
          </ConnectForm>
        );
      }}
    </AgentForm>
  );
}
