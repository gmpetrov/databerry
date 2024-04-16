import { zodResolver } from '@hookform/resolvers/zod';
import ImageRoundedIcon from '@mui/icons-material/ImageRounded';
import ErrorRoundedIcon from '@mui/icons-material/ErrorRounded';

import SendRoundedIcon from '@mui/icons-material/SendRounded';
import SmartToyRoundedIcon from '@mui/icons-material/SmartToyRounded';
import StopRoundedIcon from '@mui/icons-material/StopRounded';

import UnfoldLessOutlinedIcon from '@mui/icons-material/UnfoldLessOutlined';
import UnfoldMoreOutlinedIcon from '@mui/icons-material/UnfoldMoreOutlined';
import ArticleTwoToneIcon from '@mui/icons-material/ArticleTwoTone';
import Alert from '@mui/joy/Alert';

import Button from '@mui/joy/Button';
import Card from '@mui/joy/Card';
import Chip from '@mui/joy/Chip';
import ChipDelete from '@mui/joy/ChipDelete';
import CircularProgress from '@mui/joy/CircularProgress';
import IconButton from '@mui/joy/IconButton';

import Skeleton from '@mui/joy/Skeleton';
import Stack from '@mui/joy/Stack';
import Textarea from '@mui/joy/Textarea';
import React, { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import InfiniteScroll from 'react-infinite-scroller';
import { z } from 'zod';
import { zIndex } from '@chaindesk/ui/embeds/common/utils';

import { AcceptedMimeTypes } from '@chaindesk/lib/accepted-mime-types';

import { ChatMessage, MessageEvalUnion } from '@chaindesk/lib/types';
import type { Source } from '@chaindesk/lib/types/document';

import AnimateMessagesOneByOne from '@chaindesk/ui/Chatbox/AnimateMessagesOneByOne';
import Message from '@chaindesk/ui/Chatbox/ChatMessage';

import PoweredBy from '@chaindesk/ui/PoweredBy';

import FileUploader from '@chaindesk/ui/FileUploader';
import TraditionalForm from '@chaindesk/ui/embeds/forms/traditional';
import Select from '@mui/joy/Select';
import Option from '@mui/joy/Option';
import type { Attachment } from '@chaindesk/prisma';
import useFileUpload from '../hooks/useFileUpload';
import Typography from '@mui/joy/Typography';

export type ChatBoxProps = {
  messages: ChatMessage[];
  onSubmit: (props: {
    query: string;
    files?: File[];
    isDraft?: boolean;
    attachmentsForAI?: string[];
  }) => Promise<any>;
  messageTemplates?: string[];
  initialMessage?: string;
  initialMessages?: ChatMessage[];
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
    value: MessageEvalUnion;
  }) => any;
  handleImprove?: (message: ChatMessage, msgIndex: number) => any;
  topSettings?: JSX.Element | null;
  handleSourceClick?: (source: Source) => any;
  handleAbort?: any;
  emptyComponent?: JSX.Element | null;
  hideInternalSources?: boolean;
  userImgUrl?: string;
  organizationId?: string | null;
  refreshConversation?: () => any;
  metadata?: Record<string, unknown>;
  withFileUpload?: boolean;
  draftReplyInput?: JSX.Element | null;
  withSources?: boolean;
  isAiEnabled?: boolean;
  autoFocus?: boolean;
  agentIconStyle?: React.CSSProperties;
  fromInbox?: boolean;
  fromDashboard?: boolean;
  conversationAttachments?: Attachment[];
};

const Schema = z.object({ query: z.string().min(1) });

function ChatBox({
  messages,
  onSubmit,
  messageTemplates,
  initialMessage,
  initialMessages,
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
  userImgUrl,
  organizationId,
  refreshConversation,
  metadata,
  withFileUpload,
  draftReplyInput,
  withSources,
  isAiEnabled,
  autoFocus,
  agentIconStyle,
  fromInbox,
  conversationAttachments,
  fromDashboard,
}: ChatBoxProps) {
  const chatboxRef = React.useRef<HTMLDivElement>(null);
  const scrollableRef = React.useRef<HTMLDivElement>(null);
  const textAreaRef = React.useRef<HTMLTextAreaElement | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInKeyboadComposition, setIsInKeyboadComposition] = useState(false);
  const [firstMsgs, setFirstMsgs] = useState<ChatMessage[]>([]);
  // const [ini, setFirstMsg] = useState<ChatMessage>();
  // const [firstMsg, setFirstMsg] = useState<ChatMessage>();
  const [files, setFiles] = useState<File[]>([] as File[]);
  const { isDragOver } = useFileUpload({
    ref: chatboxRef,
    changeCallback: setFiles,
  });
  const [attachmentsForAI, setAttachmentsForAI] = useState<string[]>(
    [] as string[]
  );
  const [isTextAreaExpanded, setIsTextAreaExpended] = useState(false);

  const [hideTemplateMessages, setHideTemplateMessages] = useState(false);
  const lastMessageLength =
    messages?.length > 0
      ? messages?.[messages?.length - 1]?.message?.length +
        (messages?.[messages?.length - 1]?.attachments || [])?.length
      : 0;

  const methods = useForm<z.infer<typeof Schema>>({
    resolver: zodResolver(Schema),
    defaultValues: {},
  });

  const toogleKeyboardComposition = useCallback(() => {
    setIsInKeyboadComposition((prev) => !prev);
  }, [setIsInKeyboadComposition]);

  const submit = async ({ query }: z.infer<typeof Schema>) => {
    if (isLoading || isInKeyboadComposition) {
      return;
    }

    try {
      setIsLoading(true);
      setHideTemplateMessages(true);
      setIsTextAreaExpended(false);
      methods.reset();
      await onSubmit({
        query,
        files,
        attachmentsForAI,
      });
      setFiles([]);
    } catch (err) {
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    if (!scrollableRef.current) {
      return;
    }

    const t = setTimeout(() => {
      scrollableRef.current?.scrollTo(
        0,
        scrollableRef.current?.scrollHeight + 100
      );
    }, 50);
    return () => {
      clearTimeout(t);
    };
  }, [lastMessageLength, messages?.length]);

  React.useEffect(() => {
    const t = setTimeout(() => {
      const msgs = (initialMessages || []).map(
        (each) =>
          ({
            from: 'agent',
            message: each?.message?.trim?.(),
            iconUrl: agentIconUrl,
            component: each?.component,
            approvals: [],
          } as ChatMessage)
      );

      setFirstMsgs(msgs);
    }, 0);

    return () => {
      clearTimeout(t);
    };
  }, [initialMessages, agentIconUrl]);

  const handleOnDraftReply = useCallback(
    (query: string) => {
      methods.setValue('query', query, {
        shouldDirty: true,
        shouldValidate: true,
      });
    },
    [methods.setValue]
  );

  return (
    <Stack
      ref={chatboxRef}
      className="chaindesk-chatbox"
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
        gap: 0,
        position: 'relative',
      }}
    >
      {isDragOver && (
        <Stack
          sx={(t) => ({
            position: 'absolute',
            pointerEvents: 'none',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 2,
            justifyContent: 'center',
            alignItems: 'center',
            p: 2,
          })}
          className="bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-violet-500/80"
        >
          <Card color="primary">
            <Stack
              sx={{ justifyContent: 'center', alignItems: 'center' }}
              gap={1}
            >
              <ImageRoundedIcon sx={{ opacity: 0.5, fontSize: 32 }} />

              <Typography component="label" level="body-sm" color="neutral">
                Drop files here
              </Typography>
            </Stack>
          </Card>
        </Stack>
      )}
      {typeof isAiEnabled === 'boolean' &&
        !isAiEnabled &&
        messages?.length > 0 && (
          <Chip
            color="danger"
            sx={{
              left: '50%',
              transform: 'translateX(-50%)',
              top: 10,
              position: 'absolute',
              zIndex: 1,
            }}
            variant="soft"
            size="sm"
            startDecorator={<SmartToyRoundedIcon />}
          >
            off
          </Chip>
        )}

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
          pb: 4,
          pt: 2,
          mb: -2,

          // Scrollbar
          scrollbarColor: 'rgba(0,0,0,.1) transparent',
          '&::-webkit-scrollbar': {
            width: '0.4em',
          },
          '&::-webkit-scrollbar-track': {
            display: 'none',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'rgba(0,0,0,.0)',
            borderRadius: '20px',
          },
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
            {messages?.length < 2 ? (
              <AnimateMessagesOneByOne messages={firstMsgs} />
            ) : (
              firstMsgs?.map((each, index) => (
                <Message key={index} message={each} />
              ))
            )}

            {isLoadingConversation && messages?.length <= 0 && (
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

            {messages?.length <= 0 && !isLoadingConversation && emptyComponent}

            {(!isLoadingConversation || messages?.length > 0) &&
              messages.map((each, index) => (
                <React.Fragment key={index}>
                  {each.metadata?.shouldDisplayForm ? (
                    <Stack sx={{ zIndex: 0, px: 5 }}>
                      <TraditionalForm
                        formId={each.metadata.formId}
                        conversationId={each.conversationId}
                        messageId={each.id}
                        submissionId={each?.submission?.id}
                        values={each?.submission?.data}
                        readOnly={fromInbox}
                      />
                    </Stack>
                  ) : (
                    <Message
                      index={index}
                      message={{
                        ...each,
                        iconUrl:
                          each.from === 'agent'
                            ? agentIconUrl
                            : userImgUrl || each.iconUrl,
                      }}
                      withSources={withSources}
                      hideInternalSources={hideInternalSources}
                      handleEvalAnswer={handleEvalAnswer}
                      handleImprove={handleImprove}
                      handleSourceClick={handleSourceClick}
                      refreshConversation={refreshConversation}
                      organizationId={organizationId!}
                    />
                  )}
                </React.Fragment>
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
          onCompositionStart={toogleKeyboardComposition}
          onCompositionEnd={toogleKeyboardComposition}
          onSubmit={(e) => {
            e.stopPropagation();

            methods.handleSubmit(submit)(e);
          }}
        >
          <Stack gap={1}>
            {isAiEnabled &&
              conversationAttachments &&
              conversationAttachments?.length > 0 && (
                <Select
                  size="sm"
                  slotProps={{
                    listbox: {
                      sx: {
                        zIndex: zIndex + 1,
                      },
                    },
                  }}
                  sx={{ mr: 'auto', mb: 0.5 }}
                  startDecorator={<ArticleTwoToneIcon />}
                  placeholder="Use uploaded file"
                  // variant="plain"
                  className="max-w-full truncate"
                  multiple
                  color={attachmentsForAI?.length > 0 ? 'warning' : 'neutral'}
                  variant={attachmentsForAI?.length > 0 ? 'soft' : 'plain'}
                  onChange={(_, values) => {
                    setAttachmentsForAI(values as string[]);
                  }}
                >
                  {conversationAttachments.map((each) => (
                    <Option key={each.id} value={each.id}>
                      {each.name}
                    </Option>
                  ))}
                </Select>
              )}

            {(messageTemplates?.length || 0) > 0 && files?.length <= 0 && (
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

                  scrollbarColor: 'rgba(0,0,0,.1) transparent',
                  '&::-webkit-scrollbar': {
                    height: '0.4em',
                  },
                  '&::-webkit-scrollbar-track': {
                    display: 'none',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    backgroundColor: 'rgba(0,0,0,.0)',
                    borderRadius: '20px',
                  },
                }}
              >
                {messageTemplates?.map((each, idx) => (
                  <Button
                    key={idx}
                    size="sm"
                    variant="soft"
                    onClick={() => submit({ query: each })}
                    sx={{ whiteSpace: 'nowrap' }}
                  >
                    {each}
                  </Button>
                ))}
              </Stack>
            )}
          </Stack>
          <Stack width="100%" gap={0.5}>
            {topSettings}

            {files?.length > 0 && (
              <Stack gap={1} sx={{ mb: 1 }}>
                <Stack direction="row" sx={{ flexWrap: 'wrap' }} gap={1}>
                  {files.map((each, index) => (
                    <Chip
                      size="lg"
                      key={each.name}
                      variant="soft"
                      color="primary"
                      endDecorator={
                        <ChipDelete
                          disabled={isLoading}
                          onDelete={() =>
                            setFiles(files.filter((_, i) => i !== index))
                          }
                        />
                      }
                    >
                      {each.name}
                    </Chip>
                  ))}
                </Stack>
                <Stack gap={1}>
                  <Alert
                    color="warning"
                    size="sm"
                    startDecorator={<ErrorRoundedIcon />}
                  >
                    Image, audio and video files are not supported by the AI.
                    Unsupported files will not be processed by the AI.
                  </Alert>
                  {fromDashboard && (
                    <Alert
                      color="primary"
                      size="sm"
                      startDecorator={<ErrorRoundedIcon />}
                    >
                      To support image processing, use a vision compatible LLM
                      (GPT-4 Turbo, Claude 3)
                    </Alert>
                  )}
                </Stack>
              </Stack>
            )}

            <Textarea
              // placeholder="Press Shift + Enter to move to the next line"
              autoFocus={!!autoFocus}
              slotProps={{
                textarea: {
                  id: 'chatbox-input',
                  ref: textAreaRef,
                },
              }}
              maxRows={24}
              minRows={isTextAreaExpanded ? 18 : 1}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  methods.handleSubmit(submit)(e);
                }
              }}
              sx={(t) => ({
                ...(isTextAreaExpanded
                  ? {
                      position: 'absolute',
                      bottom: 0,
                      zIndex: 1,
                    }
                  : {}),
                width: '100%',
                flexDirection: 'row',
                alignItems: 'center',
                '.MuiTextarea-endDecorator': {
                  // marginBlockStart: 'auto',
                  marginBlock: 0,
                  marginTop: 'auto',
                },
                '.MuiTextarea-startDecorator': {
                  // marginBlockStart: 'auto',
                  // marginBlockStart: 0,
                  // marginTop: 'auto',
                  // width: '100%',
                  marginBlockEnd: 0,
                  marginTop: 'auto',
                  // margin: 0,
                },
              })}
              variant="outlined"
              startDecorator={
                <Stack
                  direction={'row'}
                  justifyContent={'space-between'}
                  sx={{ width: '100%' }}
                >
                  <IconButton
                    variant="plain"
                    sx={{ maxHeight: '100%' }}
                    size="sm"
                    onClick={() => setIsTextAreaExpended(!isTextAreaExpanded)}
                  >
                    {isTextAreaExpanded ? (
                      <UnfoldLessOutlinedIcon />
                    ) : (
                      <UnfoldMoreOutlinedIcon />
                    )}
                  </IconButton>
                </Stack>
              }
              // disabled={isLoading} // Disabled otherwise stop button is not clickable

              endDecorator={
                <Stack
                  direction={'row'}
                  justifyContent={'space-between'}
                  sx={{ width: '100%' }}
                  spacing={1}
                >
                  {draftReplyInput &&
                    React.cloneElement(draftReplyInput, {
                      onReply: handleOnDraftReply,
                      inputRef: textAreaRef,
                    })}

                  {withFileUpload && (
                    <FileUploader
                      accept={
                        AcceptedMimeTypes
                        // (isAiEnabled
                        //   ? AcceptedAIEnabledMimeTypes
                        //   : AcceptedAIDisabledMimeType) || []
                      }
                      changeCallback={(f) => setFiles(f)}
                    />
                  )}

                  <Stack direction="row" sx={{ ml: 'auto' }}>
                    {!isLoading && (
                      <IconButton
                        size="sm"
                        type="submit"
                        disabled={isLoading || !methods.formState.isValid}
                        sx={{ maxHeight: '100%' }}
                        color="primary"
                        variant="soft"
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
                </Stack>
              }
              {...methods.register('query')}
              onBlur={(e) => {}} // // Otherwise got error when submiting with return key 🤷
            />

            <Stack>
              <Stack
                direction="row"
                sx={{
                  position: 'relative',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  maxWidth: '100%',
                  overflowX: 'auto',
                  // Scrollbar
                  '&::-webkit-scrollbar': {
                    height: '0',
                  },
                }}
              >
                {renderBottom}
              </Stack>
              {!disableWatermark && (
                <Stack sx={{ mt: 1 }}>
                  <PoweredBy />
                </Stack>
              )}
            </Stack>
          </Stack>
        </form>
      )}
    </Stack>
  );
}

export default ChatBox;
