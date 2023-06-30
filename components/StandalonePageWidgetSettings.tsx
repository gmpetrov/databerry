import createCache from '@emotion/cache';
import { CacheProvider, ThemeProvider } from '@emotion/react';
import { zodResolver } from '@hookform/resolvers/zod';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
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
  CircularProgress,
  CssBaseline,
  Divider,
  FormControl,
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

export default function StandalonePageSettings(props: Props) {
  const { data: session, status } = useSession();
  const [state, setState] = useStateReducer({
    counter: 0,
  });
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

      setState({
        counter: state.counter + 1,
      });
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

  const pageURL = `${process.env.NEXT_PUBLIC_DASHBOARD_URL}/agents/${getAgentQuery?.data?.id}/page`;

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
            <Stack gap={2} width="100%">
              <Stack id="embed" gap={2} mt={4} mb={2}>
                <Typography>Standalone Page URL</Typography>

                <Alert color="warning">
                  Anyone can access your agent from this URL
                </Alert>

                <Alert
                  sx={{ cursor: 'copy' }}
                  onClick={() => {
                    navigator.clipboard.writeText(pageURL);
                    toast.success('Copied!', {
                      position: 'bottom-center',
                    });
                  }}
                >
                  {pageURL}
                </Alert>

                <iframe
                  style={{
                    width: '100%',
                    height: '500px',
                    borderRadius: '15px',
                  }}
                  src={`/agents/${getAgentQuery?.data?.id}/page?counter=${state.counter}`}
                  frameBorder="0"
                ></iframe>
              </Stack>
              <Stack width="100%" gap={3}>
                <FormControl>
                  <FormLabel>Initial Message</FormLabel>
                  <Input
                    placeholder="👋 Hi, How can I help you?"
                    {...methods.register('initialMessage')}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Message Templates</FormLabel>

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

                <Stack gap={1}>
                  <Typography>Social Links</Typography>
                  <Stack gap={2} pl={2}>
                    <FormControl>
                      <FormLabel>Twitter</FormLabel>
                      <Input
                        startDecorator={<TwitterIcon />}
                        placeholder="Twitter"
                        {...methods.register('twitterURL')}
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel>Instagram</FormLabel>
                      <Input
                        startDecorator={<InstagramIcon />}
                        placeholder="Instagram"
                        {...methods.register('instagramURL')}
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
                        {...methods.register('tiktokURL')}
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel>Youtube</FormLabel>
                      <Input
                        startDecorator={<YoutubeIcon />}
                        placeholder="Youtube"
                        {...methods.register('youtubeURL')}
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel>GitHub</FormLabel>
                      <Input
                        startDecorator={<GitHubIcon />}
                        placeholder="GitHub"
                        {...methods.register('githubURL')}
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel>Website</FormLabel>
                      <Input
                        startDecorator={<WebIcon />}
                        placeholder="Website"
                        {...methods.register('websiteURL')}
                      />
                    </FormControl>
                  </Stack>
                </Stack>

                {/* <FormControl>
                  <FormLabel>Brand Color</FormLabel>
                  <Input
                    defaultValue={config?.primaryColor || '#000000'}
                    placeholder="#000000"
                    {...methods.register('primaryColor')}
                  />
                </FormControl> */}

                <Button
                  type="submit"
                  loading={isLoading}
                  sx={{ ml: 'auto', mt: 2 }}
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
