import { zodResolver } from '@hookform/resolvers/zod';
import LanguageRoundedIcon from '@mui/icons-material/LanguageRounded';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import Avatar from '@mui/joy/Avatar';
import Box from '@mui/joy/Box';
import Button from '@mui/joy/Button';
import Card from '@mui/joy/Card';
import Chip from '@mui/joy/Chip';
import CircularProgress from '@mui/joy/CircularProgress';
import IconButton from '@mui/joy/IconButton';
import Input from '@mui/joy/Input';
import Stack from '@mui/joy/Stack';
import Textarea from '@mui/joy/Textarea';
import Typography from '@mui/joy/Typography';
import clsx from 'clsx';
import { useSession } from 'next-auth/react';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { z } from 'zod';

import type { Source } from '@app/types/document';

import SourceComponent from './Source';

type Message = {
  from: 'human' | 'agent';
  message: string;
  createdAt?: Date;
  sources?: Source[];
};

type Props = {
  messages: Message[];
  onSubmit: (message: string) => Promise<any>;
  messageTemplates?: string[];
  initialMessage?: string;
  readOnly?: boolean;
  disableWatermark?: boolean;
  renderAfterMessages?: JSX.Element | null;
  agentIconUrl?: string;
};

const Schema = z.object({ query: z.string().min(1) });

function ChatBox({
  messages,
  onSubmit,
  messageTemplates,
  initialMessage,
  readOnly,
  renderAfterMessages,
  disableWatermark,
  agentIconUrl,
}: Props) {
  const session = useSession();
  const scrollableRef = React.useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [firstMsg, setFirstMsg] = useState<Message>();
  const [hideTemplateMessages, setHideTemplateMessages] = useState(false);
  const lastMessageLength =
    messages?.length > 0
      ? messages?.[messages?.length - 1]?.message?.length
      : 0;

  const methods = useForm<z.infer<typeof Schema>>({
    resolver: zodResolver(Schema),
    defaultValues: {},
  });

  const submit = async ({ query }: z.infer<typeof Schema>) => {
    try {
      setIsLoading(true);
      setHideTemplateMessages(true);
      methods.reset();
      await onSubmit(query);
    } catch (err) {
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    if (!scrollableRef.current) {
      return;
    }

    scrollableRef.current.scrollTo(0, scrollableRef.current.scrollHeight);
  }, [lastMessageLength]);

  React.useEffect(() => {
    setTimeout(() => {
      setFirstMsg(
        initialMessage ? { from: 'agent', message: initialMessage } : undefined
      );
    }, 0);
  }, [initialMessage]);

  return (
    <Stack
      direction={'column'}
      gap={2}
      sx={{
        display: 'flex',
        flex: 1,
        flexBasis: '100%',
        maxWidth: '700px',
        width: '100%',
        height: '100%',
        maxHeight: '100%',
        minHeight: '100%',
        mx: 'auto',
      }}
    >
      <Stack
        ref={scrollableRef}
        direction={'column'}
        gap={2}
        sx={{
          boxSizing: 'border-box',
          maxWidth: '100%',
          width: '100%',
          mx: 'auto',
          flex: 1,
          maxHeight: '100%',
          overflowY: 'auto',
          pb: 8,
          pt: 2,
        }}
      >
        {firstMsg && (
          <Stack sx={{ width: '100%' }} direction={'row'} gap={1}>
            <Avatar
              size="sm"
              variant="outlined"
              src={agentIconUrl || '/app-rounded-bg-white.png'}
            ></Avatar>
            <Card
              size="sm"
              variant={'outlined'}
              color={'primary'}
              className="prose-sm message-agent"
              sx={{
                mr: 'auto',
                ml: 'none',
                whiteSpace: 'pre-wrap',
              }}
            >
              {firstMsg?.message}
            </Card>
          </Stack>
        )}

        {messages.map((each, index) => (
          <Stack
            key={index}
            sx={{
              width: '100%',
              maxWidth: '100%',
              mr: each.from === 'agent' ? 'auto' : 'none',
              ml: each.from === 'human' ? 'auto' : 'none',
            }}
          >
            <Stack
              sx={{
                width: '100%',
                maxWidth: '100%',
              }}
              direction={'row'}
              gap={1}
            >
              {each.from === 'agent' && (
                <Avatar
                  size="sm"
                  variant="outlined"
                  src={agentIconUrl || '/app-rounded-bg-white.png'}
                ></Avatar>
              )}

              {each.from === 'human' && (
                <Avatar
                  size="sm"
                  variant="outlined"
                  src={session?.data?.user?.image || undefined}
                ></Avatar>
              )}

              <Card
                size="sm"
                variant={'outlined'}
                className={clsx(
                  each.from === 'agent' ? 'message-agent' : 'message-human'
                )}
                color={each.from === 'agent' ? 'primary' : 'neutral'}
                sx={(theme) => ({
                  overflowY: 'hidden',
                  overflowX: 'auto',
                  marginRight: 'auto',
                  maxWidth: '100%',
                  py: 0,
                  px: 2,
                  [' p ']: {
                    m: 0,
                    py: 1,
                    maxWidth: '100%',
                    // wordBreak: 'break-word',
                  },
                  table: {
                    overflowX: 'auto',
                  },
                  // pre: {
                  //   overflowX: 'scroll',
                  // },
                  // code: {},
                  // 'ol,ul,p': {
                  //   // color: theme.palette.text.secondary,
                  // },
                  // 'ol, ul': {
                  //   my: 0,
                  //   pl: 2,
                  // },
                  // ol: {
                  //   listStyle: 'numeric',
                  // },
                  // // 'ol > li > p': {
                  // //   fontWeight: 'bold',
                  // // },
                  // ul: {
                  //   listStyle: 'disc',
                  //   mb: 2,
                  // },
                  // li: {
                  //   my: 1,
                  // },
                  // 'li::marker, ol::marker': {
                  //   // color: theme.palette.text.tertiary,
                  // },
                  // a: {
                  //   // color: theme.palette.text.primary,
                  //   textDecoration: 'underline',
                  // },
                  // [' p ']: {
                  // py: 1,
                  // m: 0,
                  // },
                })}
              >
                {each.from === 'agent' ? (
                  <ReactMarkdown
                    className="prose-sm prose dark:prose-invert"
                    remarkPlugins={[remarkGfm]}
                    linkTarget={'_blank'}
                  >
                    {each.message}
                  </ReactMarkdown>
                ) : (
                  <p className="prose-sm ">{each.message}</p>
                )}

                {(each?.sources?.length || 0) > 0 && (
                  <Box
                    sx={{
                      pb: 2,
                    }}
                  >
                    <details>
                      <summary>Sources</summary>
                      <Stack direction={'column'} gap={1} sx={{ pt: 1 }}>
                        {each?.sources?.map((source) => (
                          <SourceComponent
                            key={source.chunk_id}
                            source={source}
                          />
                        ))}
                      </Stack>
                    </details>
                  </Box>
                )}
              </Card>
            </Stack>
          </Stack>
        ))}

        {isLoading && (
          <CircularProgress
            variant="soft"
            color="neutral"
            size="sm"
            sx={{ mx: 'auto', my: 2 }}
          />
        )}
      </Stack>

      {!!hideTemplateMessages && renderAfterMessages}

      {/* </Stack> */}

      {/* <div className="w-full h-12 -translate-y-1/2 pointer-events-none backdrop-blur-lg"></div> */}
      {!readOnly && (
        <form
          style={{
            maxWidth: '100%',
            width: '100%',
            position: 'relative',
            display: 'flex',

            marginTop: 'auto',
            overflow: 'visible',
            background: 'none',
            justifyContent: 'center',
            marginLeft: 'auto',
            marginRight: 'auto',
            // paddingLeft: 'inherit',
            // paddingRight: 'inherit',
          }}
          onSubmit={(e) => {
            e.stopPropagation();

            methods.handleSubmit(submit)(e);
          }}
        >
          {!hideTemplateMessages && (messageTemplates?.length || 0) > 0 && (
            <Stack
              direction="row"
              gap={1}
              sx={{
                position: 'absolute',
                zIndex: 1,
                transform: 'translateY(-100%)',
                flexWrap: 'wrap',
                mt: -1,
                left: '0',
              }}
            >
              {messageTemplates?.map((each, idx) => (
                <Button
                  key={idx}
                  size="sm"
                  variant="soft"
                  onClick={() => submit({ query: each })}
                >
                  {each}
                </Button>
              ))}
            </Stack>
          )}

          <Stack width="100%">
            <Textarea
              maxRows={4}
              minRows={1}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  methods.handleSubmit(submit)(e);
                }
              }}
              sx={{
                width: '100%',
                flexDirection: 'row',
                alignItems: 'center',
                '.MuiTextarea-endDecorator': {
                  'margin-block-start': 'auto',
                },
              }}
              // disabled={!state.currentDatastoreId || state.loading}
              variant="outlined"
              endDecorator={
                <IconButton
                  size="sm"
                  type="submit"
                  disabled={isLoading}
                  sx={{ maxHeight: '100%' }}
                >
                  <SendRoundedIcon />
                </IconButton>
              }
              {...methods.register('query')}
            />

            {!disableWatermark && (
              <a
                href="https://chaindesk.ai"
                target="_blank"
                style={{
                  textDecoration: 'none',
                  marginLeft: 'auto',
                }}
              >
                <Box sx={{ mt: 1 }}>
                  <Typography level="body3">
                    Powered by{' '}
                    <Typography color="primary" fontWeight={'bold'}>
                      Chaindesk
                    </Typography>
                  </Typography>
                </Box>
              </a>
            )}
          </Stack>
        </form>
      )}
    </Stack>
  );
}

export default ChatBox;
