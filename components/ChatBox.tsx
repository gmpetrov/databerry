import { zodResolver } from '@hookform/resolvers/zod';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import Avatar from '@mui/joy/Avatar';
import Box from '@mui/joy/Box';
import Button from '@mui/joy/Button';
import Card from '@mui/joy/Card';
import CircularProgress from '@mui/joy/CircularProgress';
import IconButton from '@mui/joy/IconButton';
import Input from '@mui/joy/Input';
import Stack from '@mui/joy/Stack';
import Typography from '@mui/joy/Typography';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { z } from 'zod';

type Message = {
  from: 'human' | 'agent';
  message: string;
  createdAt?: Date;
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
              className="message-agent"
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
              sx={{ width: '100%', maxWidth: '100%' }}
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
              <Card
                size="sm"
                variant={'outlined'}
                className={
                  each.from === 'agent' ? 'message-agent' : 'message-human'
                }
                color={each.from === 'agent' ? 'primary' : 'neutral'}
                sx={(theme) => ({
                  overflow: 'hidden',
                  maxWidth: '100%',
                  '*': {
                    maxWidth: '100%',
                    wordBreak: 'break-word',
                  },
                  pre: {
                    overflowX: 'scroll',
                  },
                  code: {},
                  py: 0,
                  px: 2,
                  'ol,ul,p': {
                    // color: theme.palette.text.secondary,
                  },
                  'ol, ul': {
                    my: 0,
                    pl: 2,
                  },
                  ol: {
                    listStyle: 'numeric',
                  },
                  // 'ol > li > p': {
                  //   fontWeight: 'bold',
                  // },
                  ul: {
                    listStyle: 'disc',
                    mb: 2,
                  },
                  li: {
                    my: 1,
                  },
                  'li::marker, ol::marker': {
                    // color: theme.palette.text.tertiary,
                  },
                  a: {
                    // color: theme.palette.text.primary,
                    textDecoration: 'underline',
                  },
                  [' p ']: {
                    py: 1,
                    m: 0,
                  },
                })}
              >
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  linkTarget={'_blank'}
                >
                  {each.message}
                </ReactMarkdown>
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
            <Input
              sx={{ width: '100%' }}
              // disabled={!state.currentDatastoreId || state.loading}
              variant="outlined"
              endDecorator={
                <IconButton type="submit" disabled={isLoading}>
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
