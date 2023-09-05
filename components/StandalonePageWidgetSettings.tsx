import { zodResolver } from '@hookform/resolvers/zod';
import AlternateEmailRoundedIcon from '@mui/icons-material/AlternateEmailRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import ContentPasteRoundedIcon from '@mui/icons-material/ContentPasteRounded';
import GitHubIcon from '@mui/icons-material/GitHub';
import InstagramIcon from '@mui/icons-material/Instagram';
import WebIcon from '@mui/icons-material/Language';
import TwitterIcon from '@mui/icons-material/Twitter';
import YoutubeIcon from '@mui/icons-material/YouTube';
import {
  Alert,
  Box,
  Button,
  Card,
  Checkbox,
  Chip,
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
import pDebounce from 'p-debounce';
import React, { useEffect, useState } from 'react';
import Frame, { FrameContextConsumer } from 'react-frame-component';
import { Controller, useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import html from 'react-syntax-highlighter/dist/esm/languages/hljs/htmlbars';
import useSWR from 'swr';
import { z } from 'zod';

import useStateReducer from '@app/hooks/useStateReducer';
import { getAgent } from '@app/pages/api/agents/[id]';
import { UpsertAgentSchema } from '@app/types/dtos';
import { AgentInterfaceConfig } from '@app/types/models';
import { fetcher } from '@app/utils/swr-fetcher';
import writeClipboard from '@app/utils/write-clipboard';

if (typeof window !== 'undefined') {
  SyntaxHighlighter.registerLanguage('htmlbars', html);
}

type Props = {
  isOpen: boolean;
  handleCloseModal: () => any;
  agentId: string;
};

export default function StandalonePageSettings(props: Props) {
  const { data: session, status } = useSession();
  const [state, setState] = useStateReducer({
    counter: 0,
    isValidatingHandle: false,
  });
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const getAgentQuery = useSWR<Prisma.PromiseReturnType<typeof getAgent>>(
    `/api/agents/${props.agentId}`,
    fetcher
  );

  const methods = useForm<UpsertAgentSchema>({
    resolver: zodResolver(UpsertAgentSchema),
    defaultValues: getAgentQuery?.data as UpsertAgentSchema,
  });

  const onSubmit = async (values: UpsertAgentSchema) => {
    try {
      setIsLoading(true);

      const isHandleValid = await validateHandle(values.handle as string);

      if (!isHandleValid) {
        throw 'Handle not valid';
      }

      console.log('values', values);

      await toast.promise(
        axios.post('/api/agents', {
          ...getAgentQuery?.data,
          ...values,
        }),
        {
          loading: 'Updating...',
          success: 'Updated!',
          error: 'Something went wrong',
        }
      );

      getAgentQuery.mutate();

      setState({
        counter: state.counter + 1,
      });
    } catch (err) {
      console.log(err);
    } finally {
      setIsLoading(false);
    }
  };

  const validateHandle = async (value?: string) => {
    let isHandleValid = false;
    try {
      setState({
        isValidatingHandle: true,
      });

      if (!value) {
        throw '';
      }

      const isValid = await methods.trigger('handle');

      if (!isValid) {
        throw '';
      }

      const res = await axios.post(`/api/agents/check-handle-available`, {
        handle: value,
      });

      if (
        res.data.available ||
        (!res.data.available && res.data?.agentId === getAgentQuery?.data?.id)
      ) {
        methods.setValue('handle', value);
        isHandleValid = true;
      } else {
        methods.setError('handle', {
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

  useEffect(() => {
    if (getAgentQuery.data) {
      methods.reset(getAgentQuery.data as UpsertAgentSchema);
    }
  }, [getAgentQuery.data]);

  const config = getAgentQuery?.data?.interfaceConfig as AgentInterfaceConfig;

  console.debug('errors', methods.formState.errors);

  const botHandle = methods.watch('handle');
  const pageURL = `${process.env.NEXT_PUBLIC_DASHBOARD_URL?.replace(
    'app.',
    ''
  )}/@${botHandle}`;

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
        <Typography level="h4">Standalone Web Page</Typography>
        <Typography color="neutral" level="h6">
          Settings
        </Typography>
        <Divider sx={{ my: 2 }}></Divider>

        <form onSubmit={methods.handleSubmit(onSubmit)}>
          <Stack gap={3}>
            <Alert color="warning">
              {'🚨 To use this feature Agent visibility "public" is required'}
            </Alert>

            <Stack gap={2} width="100%">
              <Stack id="embed" gap={2} mt={4} mb={2}>
                {/* <Typography>Standalone Page URL</Typography> */}

                <Stack gap={1}>
                  <FormControl
                    error={!!methods.formState.errors?.handle?.message}
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
                      {...methods.register('handle')}
                      // disabled={state.isValidatingHandle}
                      onChange={pDebounce(async (e) => {
                        validateHandle(e.target.value?.toLowerCase());
                      }, 1000)}
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
                      {methods.formState.errors?.handle?.message}
                    </FormHelperText>
                  </FormControl>
                  {botHandle && !methods.formState.errors?.handle?.message && (
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
                      <Alert color="warning" sx={{ width: '100%' }}>
                        Anyone can access your agent from this URL
                      </Alert>
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
                  )}/agents/${getAgentQuery?.data?.id}/page?counter=${
                    state.counter
                  }`}
                  frameBorder="0"
                ></iframe>
              </Stack>
              <Stack width="100%" gap={3}>
                <FormControl>
                  <FormLabel>Initial Message</FormLabel>
                  <Input
                    placeholder="👋 Hi, How can I help you?"
                    {...methods.register('interfaceConfig.initialMessage')}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Message Suggestions</FormLabel>

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

                        methods.setValue(
                          'interfaceConfig.messageTemplates',
                          domains
                        );
                      } catch (err) {
                        console.log('err', err);
                      }
                    }}
                  />
                </FormControl>

                <Stack gap={4}>
                  <Stack gap={1}>
                    <Typography>Social Links</Typography>
                    <Stack gap={2} pl={2}>
                      <FormControl>
                        <FormLabel>Twitter</FormLabel>
                        <Input
                          startDecorator={<TwitterIcon />}
                          placeholder="Twitter"
                          {...methods.register('interfaceConfig.twitterURL')}
                        />
                      </FormControl>

                      <FormControl>
                        <FormLabel>Instagram</FormLabel>
                        <Input
                          startDecorator={<InstagramIcon />}
                          placeholder="Instagram"
                          {...methods.register('interfaceConfig.instagramURL')}
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
                          {...methods.register('interfaceConfig.tiktokURL')}
                        />
                      </FormControl>

                      <FormControl>
                        <FormLabel>Youtube</FormLabel>
                        <Input
                          startDecorator={<YoutubeIcon />}
                          placeholder="Youtube"
                          {...methods.register('interfaceConfig.youtubeURL')}
                        />
                      </FormControl>
                      <FormControl>
                        <FormLabel>GitHub</FormLabel>
                        <Input
                          startDecorator={<GitHubIcon />}
                          placeholder="GitHub"
                          {...methods.register('interfaceConfig.githubURL')}
                        />
                      </FormControl>
                      <FormControl>
                        <FormLabel>Website</FormLabel>
                        <Input
                          startDecorator={<WebIcon />}
                          placeholder="Website"
                          {...methods.register('interfaceConfig.websiteURL')}
                        />
                      </FormControl>
                    </Stack>
                  </Stack>
                </Stack>

                {/* <FormControl>
                  <FormLabel>Brand Color</FormLabel>
                  <Input
                    defaultValue={config?.primaryColor || '#000000'}
                    placeholder="#000000"
                    {...methods.register('interfaceConfig.primaryColor')}
                  />
                </FormControl> */}

                <Button
                  type="submit"
                  loading={isLoading}
                  sx={{ ml: 'auto', mt: 2 }}
                  disabled={state.isValidatingHandle}
                >
                  Update
                </Button>
              </Stack>
            </Stack>
          </Stack>
        </form>
      </Card>
    </Modal>
  );
}
