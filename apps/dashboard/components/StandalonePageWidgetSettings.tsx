import AlternateEmailRoundedIcon from '@mui/icons-material/AlternateEmailRounded';
import ContentPasteRoundedIcon from '@mui/icons-material/ContentPasteRounded';
import GitHubIcon from '@mui/icons-material/GitHub';
import InstagramIcon from '@mui/icons-material/Instagram';
import WebIcon from '@mui/icons-material/Language';
import TwitterIcon from '@mui/icons-material/Twitter';
import YoutubeIcon from '@mui/icons-material/YouTube';
import {
  Alert,
  Button,
  Chip,
  CircularProgress,
  FormControl,
  FormHelperText,
  FormLabel,
  Stack,
  Typography,
} from '@mui/joy';
import Input from '@mui/joy/Input';
import axios from 'axios';
import pDebounce from 'p-debounce';
import React, { useEffect, useState } from 'react';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import html from 'react-syntax-highlighter/dist/esm/languages/hljs/htmlbars';
import { isValid } from 'zod';

import useStateReducer from '@app/hooks/useStateReducer';

import {
  CreateAgentSchema,
  UpdateAgentSchema,
} from '@chaindesk/lib/types/dtos';
import writeClipboard from '@chaindesk/lib/write-clipboard';

import CommonInterfaceInput from './AgentInputs/CommonInterfaceInput';
import AgentForm from './AgentForm';
import ConnectForm from './ConnectForm';

if (typeof window !== 'undefined') {
  SyntaxHighlighter.registerLanguage('htmlbars', html);
}

type Props = {
  agentId: string;
};

export default function StandalonePageSettings(props: Props) {
  const [state, setState] = useStateReducer({
    counter: 0,
    isValidatingHandle: false,
  });

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
          <ConnectForm<UpdateAgentSchema>>
            {({ formState, register, watch, setValue, trigger, setError }) => {
              const botHandle = watch('handle');
              const pageURL = `${process.env.NEXT_PUBLIC_DASHBOARD_URL?.replace(
                'app.',
                ''
              )}/@${botHandle}`;

              const validateHandle = async (value?: string) => {
                let isHandleValid = false;
                try {
                  setState({
                    isValidatingHandle: true,
                  });

                  if (!value) {
                    throw '';
                  }

                  const validation = CreateAgentSchema.pick({
                    handle: true,
                  }).safeParse({
                    handle: value,
                  });

                  if (!validation.success) {
                    const errorMsg = validation?.error?.issues?.[0]?.message;

                    setError('handle', {
                      message: errorMsg,
                    });

                    return false;
                  }

                  const res = await axios.post(
                    `/api/agents/check-handle-available`,
                    {
                      handle: value,
                    }
                  );

                  if (
                    res.data.available ||
                    (!res.data.available &&
                      res.data?.agentId === query?.data?.id)
                  ) {
                    setValue('handle', value, {
                      shouldDirty: true,
                      shouldValidate: true,
                    });
                    isHandleValid = true;
                  } else {
                    setError('handle', {
                      message: 'Handle already taken',
                    });
                  }
                } catch (err) {
                } finally {
                  setState({
                    isValidatingHandle: false,
                  });
                }
                return isHandleValid;
              };

              return (
                <Stack gap={3} sx={{ width: '100%' }}>
                  <Alert color="warning">
                    {
                      '🚨 To use this feature Agent visibility "public" is required'
                    }
                  </Alert>

                  <Stack gap={2} width="100%">
                    <Stack id="embed" gap={2} mb={2}>
                      {/* <Typography>Standalone Page URL</Typography> */}

                      <Stack gap={1}>
                        <FormControl
                          error={!!formState.errors?.handle?.message}
                        >
                          <FormLabel>Bot Handle</FormLabel>

                          <Input
                            startDecorator={
                              state?.isValidatingHandle ? (
                                <CircularProgress size="sm" />
                              ) : (
                                <AlternateEmailRoundedIcon />
                              )
                            }
                            placeholder="my_awesome_bot"
                            {...register('handle')}
                            onChange={pDebounce(async (e) => {
                              await validateHandle(
                                e.target.value?.toLowerCase()
                              );
                            }, 500)}
                            endDecorator={
                              <Button
                                size="sm"
                                type="submit"
                                disabled={state.isValidatingHandle}
                              >
                                Update
                              </Button>
                            }
                          />

                          <FormHelperText>
                            {formState.errors?.handle?.message}
                          </FormHelperText>
                        </FormControl>
                        {botHandle && !formState.errors?.handle?.message && (
                          <Stack direction="row" gap={2}>
                            <Chip
                              size="md"
                              color="neutral"
                              endDecorator={<ContentPasteRoundedIcon />}
                              sx={{
                                mr: 'auto',
                                ':hover': {
                                  cursor: 'copy',
                                },
                              }}
                              variant="outlined"
                              onClick={() => {
                                writeClipboard({ content: pageURL });
                              }}
                            >
                              {`chaindesk.ai/@${botHandle}`}
                            </Chip>
                            {/* <Alert color="warning" sx={{ width: '100%' }}>
                              Anyone can access your agent from this URL
                            </Alert> */}
                          </Stack>
                        )}
                      </Stack>

                      <iframe
                        style={{
                          width: '100%',
                          height: '500px',
                          borderRadius: '15px',
                        }}
                        src={`${process.env.NEXT_PUBLIC_DASHBOARD_URL?.replace(
                          'app.',
                          ''
                        )}/agents/${query?.data?.id}/standalone?counter=${
                          state.counter
                        }`}
                        frameBorder="0"
                      ></iframe>
                    </Stack>
                    <Stack width="100%" gap={3}>
                      <CommonInterfaceInput />

                      <Button
                        type="submit"
                        loading={mutation.isMutating}
                        sx={{ ml: 'auto', mt: 2 }}
                        disabled={!formState.isDirty || !formState.isValid}
                      >
                        Update
                      </Button>

                      <Stack gap={4}>
                        <Stack gap={1}>
                          <Typography>Social Links</Typography>
                          <Stack gap={2} pl={2}>
                            <FormControl>
                              <FormLabel>Twitter</FormLabel>
                              <Input
                                startDecorator={<TwitterIcon />}
                                placeholder="Twitter"
                                {...register('interfaceConfig.twitterURL')}
                              />
                            </FormControl>

                            <FormControl>
                              <FormLabel>Instagram</FormLabel>
                              <Input
                                startDecorator={<InstagramIcon />}
                                placeholder="Instagram"
                                {...register('interfaceConfig.instagramURL')}
                              />
                            </FormControl>

                            <FormControl>
                              <FormLabel>TikTok</FormLabel>
                              <Input
                                startDecorator={
                                  <img
                                    style={{ width: '20px', height: '20px' }}
                                    src="https://i.pinimg.com/originals/b6/c9/dd/b6c9dda4b3983c5ecba8cf867a01bc6f.png"
                                    alt=""
                                  />
                                }
                                placeholder="TikTok"
                                {...register('interfaceConfig.tiktokURL')}
                              />
                            </FormControl>

                            <FormControl>
                              <FormLabel>Youtube</FormLabel>
                              <Input
                                startDecorator={<YoutubeIcon />}
                                placeholder="Youtube"
                                {...register('interfaceConfig.youtubeURL')}
                              />
                            </FormControl>
                            <FormControl>
                              <FormLabel>GitHub</FormLabel>
                              <Input
                                startDecorator={<GitHubIcon />}
                                placeholder="GitHub"
                                {...register('interfaceConfig.githubURL')}
                              />
                            </FormControl>
                            <FormControl>
                              <FormLabel>Website</FormLabel>
                              <Input
                                startDecorator={<WebIcon />}
                                placeholder="Website"
                                {...register('interfaceConfig.websiteURL')}
                              />
                            </FormControl>
                          </Stack>
                        </Stack>
                      </Stack>

                      <Button
                        type="submit"
                        loading={mutation.isMutating}
                        sx={{ ml: 'auto', mt: 2 }}
                        disabled={!formState.isDirty || !formState.isValid}
                      >
                        Update
                      </Button>
                    </Stack>
                  </Stack>
                </Stack>
              );
            }}
          </ConnectForm>
        );
      }}
    </AgentForm>
  );
}
