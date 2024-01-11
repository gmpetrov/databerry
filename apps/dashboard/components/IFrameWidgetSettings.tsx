import createCache from '@emotion/cache';
import { CacheProvider, ThemeProvider } from '@emotion/react';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  CssBaseline,
  FormControl,
  Stack,
  Typography,
} from '@mui/joy';
import { CssVarsProvider, StyledEngineProvider } from '@mui/joy/styles';
import React, { useEffect, useState } from 'react';
import Frame, { FrameContextConsumer } from 'react-frame-component';
import toast from 'react-hot-toast';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import html from 'react-syntax-highlighter/dist/esm/languages/hljs/htmlbars';
import docco from 'react-syntax-highlighter/dist/esm/styles/hljs/vs2015';

import { theme, themeKeys } from '@app/utils/themes/iframe-widget';

import { appUrl } from '@chaindesk/lib/config';
import { CreateAgentSchema } from '@chaindesk/lib/types/dtos';

import CommonInterfaceInput from './AgentInputs/CommonInterfaceInput';
import CustomCSSInput from './AgentInputs/CustomCSSInput';
import AgentForm from './AgentForm';
import ChatBoxFrame from './ChatBoxFrame';
import ConnectForm from './ConnectForm';
import ReactFrameStyleFix from './ReactFrameStyleFix';

if (typeof window !== 'undefined') {
  SyntaxHighlighter.registerLanguage('htmlbars', html);
}

type Props = {
  agentId: string;
};

export default function BubbleWidgetSettings(props: Props) {
  const installScript = `<iframe
  src="${appUrl}/agents/${props.agentId}/iframe"
  width="100%"
  height="100%"
  frameborder="0"
  allow="clipboard-write"
></iframe>

`;

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
                          <Checkbox
                            label="Transparent Background"
                            defaultChecked={
                              !!(query as any).data?.interfaceConfig
                                ?.isBgTransparent
                            }
                            {...register('interfaceConfig.isBgTransparent')}
                          />
                        </FormControl>

                        <Button
                          type="submit"
                          loading={mutation.isMutating}
                          disabled={!formState.isDirty || !formState.isValid}
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
                        {query?.data?.id && (
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
                                        <CssBaseline enableColorScheme />

                                        <ReactFrameStyleFix />

                                        <Box
                                          style={{
                                            width: '100vw',
                                            height: '100vh',
                                          }}
                                          sx={{
                                            body: {
                                              padding: 0,
                                              margin: 0,
                                            },
                                          }}
                                        >
                                          <ChatBoxFrame initConfig={config!} />
                                        </Box>

                                        {config?.customCSS && (
                                          <style
                                            dangerouslySetInnerHTML={{
                                              __html: config?.customCSS || '',
                                            }}
                                          ></style>
                                        )}
                                      </CssVarsProvider>
                                    </CacheProvider>
                                  </StyledEngineProvider>
                                );
                              }}
                            </FrameContextConsumer>
                          </Frame>
                        )}

                        <CustomCSSInput />
                      </Stack>
                    </Stack>
                  </Stack>
                  <Stack
                    id="embed"
                    gap={2}
                    mt={4}
                    mb={2}
                    sx={{ width: '100%' }}
                  >
                    <Typography level="body-sm">
                      To Embed the Agent as an iFrame on your website paste this
                      code into an HTML page
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
                </>
              );
            }}
          </ConnectForm>
        );
      }}
    </AgentForm>
  );
}
