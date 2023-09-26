import { zodResolver } from '@hookform/resolvers/zod';
import ContentPasteRoundedIcon from '@mui/icons-material/ContentPasteRounded';
import DoneRoundedIcon from '@mui/icons-material/DoneRounded';
import LanguageRoundedIcon from '@mui/icons-material/LanguageRounded';
import SchoolTwoToneIcon from '@mui/icons-material/SchoolTwoTone';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import StopRoundedIcon from '@mui/icons-material/StopRounded';
import ThumbDownAltRoundedIcon from '@mui/icons-material/ThumbDownAltRounded';
import ThumbUpAltRoundedIcon from '@mui/icons-material/ThumbUpAltRounded';
import Avatar from '@mui/joy/Avatar';
import Box from '@mui/joy/Box';
import Button from '@mui/joy/Button';
import Card from '@mui/joy/Card';
import CircularProgress from '@mui/joy/CircularProgress';
import IconButton from '@mui/joy/IconButton';
import Skeleton from '@mui/joy/Skeleton';
import Stack from '@mui/joy/Stack';
import Textarea from '@mui/joy/Textarea';
import Typography from '@mui/joy/Typography';
import clsx from 'clsx';
import React, { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import InfiniteScroll from 'react-infinite-scroller';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { z } from 'zod';

import type { Source } from '@app/types/document';
import filterInternalSources from '@app/utils/filter-internal-sources';

import SourceComponent from './Source';

export type ChatBoxMessage = {
  id?: string;
  eval?: 'good' | 'bad' | null;
  from: 'human' | 'agent';
  message: string;
  createdAt?: Date;
  sources?: Source[];
};

type Props = {
  messages: ChatBoxMessage[];
  onSubmit: (message: string) => Promise<any>;
  messageTemplates?: string[];
  initialMessage?: string;
  readOnly?: boolean;
  disableWatermark?: boolean;
  renderAfterMessages?: JSX.Element | null;
  renderBottom?: JSX.Element | null;
  agentIconUrl?: string;
  isLoadingConversation?: boolean;
  hasMoreMessages?: boolean;
  handleLoadMoreMessages?: () => void;
  handleEvalAnswer?: (props: {
    messageId: string;
    value: 'good' | 'bad';
  }) => any;
  handleImprove?: (message: ChatBoxMessage) => any;
  topSettings?: JSX.Element | null;
  handleSourceClick?: (source: Source) => any;
  handleAbort?: any;
  emptyComponent?: JSX.Element | null;
  hideInternalSources?: boolean;
  userImgUrl?: string;
};

const Schema = z.object({ query: z.string().min(1) });

const CopyButton = (props: { text: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(props.text);
      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (err) {}
  }, [props.text]);

  return copied ? (
    <IconButton size="sm" color="neutral" variant="plain">
      <DoneRoundedIcon fontSize={'sm'} />
    </IconButton>
  ) : (
    <IconButton size="sm" color="neutral" variant="plain" onClick={handleCopy}>
      <ContentPasteRoundedIcon fontSize={'sm'} />
    </IconButton>
  );
};

const EvalButton = (props: {
  messageId: string;
  eval?: 'good' | 'bad' | null;
  handleEvalAnswer?: (props: {
    messageId: string;
    value: 'good' | 'bad';
  }) => any;
}) => {
  const [value, setValue] = useState(props.eval);

  const handleClick = useCallback(
    async (value: 'good' | 'bad') => {
      setValue(value);

      await props.handleEvalAnswer?.({
        messageId: props.messageId,
        value,
      });
    },
    [props.handleEvalAnswer]
  );

  return (
    <React.Fragment>
      {(!value || value === 'good') && (
        <IconButton
          size="sm"
          color={value ? 'success' : 'neutral'}
          variant="plain"
          onClick={async (e) => {
            e.stopPropagation();
            await handleClick('good');
          }}
        >
          <ThumbUpAltRoundedIcon fontSize={'sm'} />
        </IconButton>
      )}
      {(!value || value === 'bad') && (
        <IconButton
          size="sm"
          color={value ? 'danger' : 'neutral'}
          variant="plain"
          onClick={async (e) => {
            e.stopPropagation();
            await handleClick('bad');
          }}
        >
          <ThumbDownAltRoundedIcon fontSize={'sm'} />
        </IconButton>
      )}
    </React.Fragment>
  );
};

function ChatBox({
  messages,
  onSubmit,
  messageTemplates,
  initialMessage,
  readOnly,
  renderAfterMessages,
  disableWatermark,
  agentIconUrl,
  isLoadingConversation,
  hasMoreMessages,
  topSettings,
  emptyComponent,
  handleLoadMoreMessages,
  handleEvalAnswer,
  handleImprove,
  handleSourceClick,
  handleAbort,
  hideInternalSources,
  renderBottom,
  userImgUrl
}: Props) {
  const scrollableRef = React.useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [firstMsg, setFirstMsg] = useState<ChatBoxMessage>();
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
    if (isLoading) {
      return;
    }

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
        initialMessage?.trim?.() ? { from: 'agent', message: initialMessage } : undefined
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

          // Scrollbar
          scrollbarColor: 'rgba(0,0,0,.3) transparent',
          '&::-webkit-scrollbar': {
            width: '0.4em'
          },
          '&::-webkit-scrollbar-track': {
            display: 'none',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'rgba(0,0,0,.3)',
            borderRadius: '20px',
          }
        }}
      >
        <InfiniteScroll
          isReverse
          useWindow={false}
          getScrollParent={() => scrollableRef.current}
          loadMore={handleLoadMoreMessages ? handleLoadMoreMessages : () => {}}
          hasMore={hasMoreMessages}
          loader={
            Array(1)
              .fill(0)
              .map((_, index) => (
                <Stack key={index} direction={'row'} gap={2} mb={2}>
                  <Skeleton variant="circular" width={34} height={34} />
                  <Stack gap={1} sx={{ width: '100%' }}>
                    <Skeleton variant="text" width={'97%'} />
                    <Skeleton variant="text" width={'92%'} />
                    <Skeleton variant="text" width={'95%'} />
                  </Stack>
                </Stack>
              )) as any
          }
        >
          <Stack gap={2}>
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

            {isLoadingConversation && (
              <Stack gap={2}>
                {Array(1)
                  .fill(0)
                  .map((_, index) => (
                    <Stack key={index} direction={'row'} gap={2}>
                      <Skeleton variant="circular" width={34} height={34} />
                      <Stack gap={1} sx={{ width: '100%' }}>
                        <Skeleton variant="text" width={'97%'} />
                        <Skeleton variant="text" width={'92%'} />
                        <Skeleton variant="text" width={'95%'} />
                      </Stack>
                    </Stack>
                  ))}
              </Stack>
            )}

            {messages?.length <= 0 && emptyComponent}

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
                      src={userImgUrl || undefined}
                    ></Avatar>
                  )}

                  <Stack>
                    <Card
                      size="sm"
                      variant={'outlined'}
                      className={clsx(
                        each.from === 'agent'
                          ? 'message-agent'
                          : 'message-human'
                      )}
                      color={each.from === 'agent' ? 'primary' : 'neutral'}
                      sx={(theme) => ({
                        overflowY: 'hidden',
                        overflowX: 'auto',
                        marginRight: 'auto',
                        gap: 0,
                        maxWidth: '100%',
                        // '.prose > *:first-child': {
                        //   pt: 1,
                        //   mt: 0,
                        // },
                        // '.prose > *:last-child': {
                        //   pb: 1,
                        //   mb: 0,
                        // },
                        py: 1,
                        px: 2,
                        [' p ']: {
                          m: 0,
                          // p: 0,
                          maxWidth: '100%',
                          // wordBreak: 'break-word',
                        },

                        'h1,h2,h3,h4,h5': {
                          fontSize: theme.fontSize.sm,
                        },
                        table: {
                          overflowX: 'auto',
                        },
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

                      <Stack direction="row" justifyContent={'space-between'}>
                        {((hideInternalSources ? filterInternalSources(each?.sources!) : each?.sources)?.length || 0) > 0 && (
                          <Box
                            sx={{
                              mt: 2,
                              width: '100%',
                              maxWidth: '100%',
                            }}
                          >
                            <details>
                              <summary className="cursor-pointer">
                                Sources
                              </summary>
                              <Stack
                                direction={'column'}
                                gap={1}
                                sx={{ pt: 1 }}
                              >
                                {(hideInternalSources ? filterInternalSources(each?.sources!) : each?.sources)?.map((source) => (
                                  <SourceComponent
                                    key={source.chunk_id}
                                    source={source}
                                    onClick={handleSourceClick}
                                  />
                                ))}
                              </Stack>
                            </details>
                          </Box>
                        )}
                      </Stack>
                    </Card>
                    {each.from === 'agent' && each?.id && (
                      <Stack
                        direction="row"
                        marginLeft={'auto'}
                        // marginBottom={'auto'}
                      >
                        <CopyButton text={each?.message} />
                        <EvalButton
                          messageId={each?.id!}
                          handleEvalAnswer={handleEvalAnswer}
                          eval={each?.eval}
                        />

                        {handleImprove && (
                          <Button
                            size="sm"
                            variant="plain"
                            color="neutral"
                            startDecorator={<SchoolTwoToneIcon />}
                            onClick={() => handleImprove(each)}
                          >
                            Improve
                          </Button>
                        )}
                      </Stack>
                    )}
                  </Stack>
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
        </InfiniteScroll>
      </Stack>

      {renderAfterMessages}

      {!readOnly && (
        <form
          style={{
            maxWidth: '100%',
            width: '100%',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',

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



          {(messageTemplates?.length || 0) > 0 && (
            <Stack
              direction="row"
              gap={1}
              sx={{
                // position: 'absolute',
                // zIndex: 1,
                // transform: 'translateY(-100%)',
                // left: '0',
                // mt: -1,
                flexWrap: 'nowrap',
                mb: 1,
                overflowX: 'auto',
                maxWidth: '100%',

                scrollbarColor: 'rgba(0,0,0,.3) transparent',
                '&::-webkit-scrollbar': {
                  height: '0.4em',
                },
                '&::-webkit-scrollbar-track': {
                  display: 'none',
                },
                '&::-webkit-scrollbar-thumb': {
                  backgroundColor: 'rgba(0,0,0,.3)',
                  borderRadius: '20px',
                }
              }}
            >
              {messageTemplates?.map((each, idx) => (
                <Button
                  key={idx}
                  size="sm"
                  variant="soft"
                  onClick={() => submit({ query: each })}
                  sx={{whiteSpace: 'nowrap'}}
                >
                  {each}
                </Button>
              ))}
            </Stack>
          )}

          <Stack width="100%" gap={0.5}>
            {topSettings}

            <Textarea
              slotProps={{
                textarea: {
                  id: 'chatbox-input',
                },
              }}
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
                <Stack direction="row">
                  {!isLoading && (
                    <IconButton
                      size="sm"
                      type="submit"
                      disabled={isLoading}
                      sx={{ maxHeight: '100%' }}
                    >
                      <SendRoundedIcon />
                    </IconButton>
                  )}

                  {isLoading && handleAbort && (
                    <IconButton
                      size="sm"
                      color="danger"
                      sx={{ maxHeight: '100%' }}
                      variant={'soft'}
                      onClick={() => {
                        handleAbort?.();
                      }}
                    >
                      <StopRoundedIcon />
                    </IconButton>
                  )}
                </Stack>
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
      
      {renderBottom}
    </Stack>
  );
}

export default ChatBox;
