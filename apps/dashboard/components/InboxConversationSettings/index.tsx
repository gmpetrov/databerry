import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import MessageRoundedIcon from '@mui/icons-material/MessageRounded';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import { ColorPaletteProp, Divider, FormControl, FormLabel } from '@mui/joy';
import Avatar from '@mui/joy/Avatar';
import Box from '@mui/joy/Box';
import Button from '@mui/joy/Button';
import Chip from '@mui/joy/Chip';
import JoyInput from '@mui/joy/Input';
import Option from '@mui/joy/Option';
import Select from '@mui/joy/Select';
import Stack from '@mui/joy/Stack';
import React, { useMemo } from 'react';
import { Controller } from 'react-hook-form';
import useSWR from 'swr';

import useInboxConversation from '@app/hooks/useInboxConversation';
import { getConversation } from '@app/pages/api/logs/[id]';
import { getMemberships } from '@app/pages/api/memberships';

import { fetcher } from '@chaindesk/lib/swr-fetcher';
import {
  Attachment,
  ConversationChannel,
  ConversationStatus,
  MessageEval,
  MessageFrom,
  Prisma,
} from '@chaindesk/prisma';

import CopyButton from '../CopyButton';
import InboxConversationFormProvider from '../InboxConversationFormProvider';
import Input from '../Input';

type Props = {
  conversationId: string;
  onStatusChange?: (status: ConversationStatus) => any;
  onDeleteConversationSuccess?: () => any;
};

function InboxConversationSettings({
  conversationId,
  onStatusChange,
  onDeleteConversationSuccess,
}: Props) {
  const getMembershipsQuery = useSWR<
    Prisma.PromiseReturnType<typeof getMemberships>
  >(`/api/memberships`, fetcher);

  const { query, deleteMutation } = useInboxConversation({
    id: conversationId,
  });

  const isHumanHandoffButtonHidden = useMemo(() => {
    let hide = false;
    const externalChannelId = query?.data?.channelExternalId;

    switch (query?.data?.channel) {
      case ConversationChannel.crisp:
      case ConversationChannel.slack:
        if (!externalChannelId) {
          hide = true;
        }
        break;
      case ConversationChannel.dashboard:
      case ConversationChannel.form:
      case ConversationChannel.mail:
        hide = true;
      default:
        break;
    }
    return hide;
  }, [
    query?.data?.channel,
    query?.data?.channelExternalId,
    query?.data?.mailInboxId,
  ]);

  return (
    <InboxConversationFormProvider id={conversationId}>
      {({ methods }) => {
        return (
          <Stack
            sx={(t) => ({
              width: '100%',
              height: '100%',
              maxWidth: '100%',
              maxHeight: '100%',
              overflowY: 'auto',
              p: 2,
            })}
            gap={2}
          >
            <Controller
              control={methods.control}
              name="isAiEnabled"
              render={({ field }) => (
                <>
                  {!isHumanHandoffButtonHidden && (
                    <Button
                      startDecorator={
                        field.value ? (
                          <MessageRoundedIcon fontSize="md" />
                        ) : (
                          <SmartToyIcon fontSize="md" />
                        )
                      }
                      size="md"
                      loading={methods.formState.dirtyFields.isAiEnabled}
                      onClick={() => {
                        field.onChange(!query.data?.isAiEnabled);
                      }}
                      color={
                        (
                          {
                            true: 'danger',
                            false: 'neutral',
                          } as any
                        )[field.value as any]
                      }
                    >
                      {!!field.value ? 'Intervene' : 'Enable AI'}
                    </Button>
                  )}
                </>
              )}
            ></Controller>

            {!isHumanHandoffButtonHidden && <Divider />}

            <FormControl>
              <FormLabel>Status</FormLabel>

              <Controller
                control={methods.control}
                name="status"
                render={({ field }) => (
                  <Select
                    {...(field as any)}
                    placeholder="Prority"
                    onChange={(_, val) => {
                      field.onChange(val);
                      onStatusChange?.(val as ConversationStatus);
                    }}
                    renderValue={(selected) => (
                      <Box
                        sx={{ display: 'flex', gap: '0.25rem', width: '100%' }}
                      >
                        <Chip
                          sx={{ width: '100%' }}
                          variant="soft"
                          // color="primary"
                          size="lg"
                          startDecorator={
                            <Box
                              sx={(t) => ({
                                width: t.spacing(1.3),
                                height: t.spacing(1.3),
                                borderRadius: '100%',
                                background: {
                                  [ConversationStatus.UNRESOLVED]:
                                    t.palette.danger[400],
                                  [ConversationStatus.HUMAN_REQUESTED]:
                                    t.palette.warning[400],
                                  [ConversationStatus.RESOLVED]:
                                    t.palette.success[400],
                                }[selected?.value as string],
                              })}
                            />
                          }
                          color={
                            (
                              {
                                [ConversationStatus.UNRESOLVED]: 'danger',
                                [ConversationStatus.HUMAN_REQUESTED]: 'warning',
                                [ConversationStatus.RESOLVED]: 'success',
                              } as Record<any, ColorPaletteProp>
                            )[selected?.value as string]
                          }
                        >
                          {selected?.label}
                        </Chip>
                      </Box>
                    )}
                  >
                    <Option value={ConversationStatus.UNRESOLVED}>
                      Unresolved
                    </Option>
                    <Option value={ConversationStatus.HUMAN_REQUESTED}>
                      Human Requested
                    </Option>
                    <Option value={ConversationStatus.RESOLVED}>
                      Resolved
                    </Option>
                  </Select>
                )}
              ></Controller>
            </FormControl>

            <FormControl>
              <FormLabel>Priority</FormLabel>

              <Controller
                control={methods.control}
                name="priority"
                render={({ field }) => (
                  <Select
                    {...(field as any)}
                    placeholder="Prority"
                    onChange={(_, val) => {
                      field.onChange(val);
                    }}
                    renderValue={(selected) => (
                      <Box
                        sx={{ display: 'flex', gap: '0.25rem', width: '100%' }}
                      >
                        <Chip
                          sx={{ width: '100%' }}
                          variant="soft"
                          // color="primary"
                          size="lg"
                          startDecorator={
                            <Box
                              sx={(t) => ({
                                width: t.spacing(1.3),
                                height: t.spacing(1.3),
                                borderRadius: '100%',
                                background: {
                                  LOW: t.palette.primary[400],
                                  MEDIUM: t.palette.warning[400],
                                  HIGH: t.palette.danger[400],
                                }[selected?.value as string],
                              })}
                            />
                          }
                          color={
                            (
                              {
                                LOW: 'primary',
                                MEDIUM: 'warning',
                                HIGH: 'danger',
                              } as Record<any, ColorPaletteProp>
                            )[selected?.value as string]
                          }
                        >
                          {selected?.label}
                        </Chip>
                      </Box>
                    )}
                  >
                    <Option value={'LOW'}>Low</Option>
                    <Option value={'MEDIUM'}>Medium</Option>
                    <Option value={'HIGH'}>High</Option>
                  </Select>
                )}
              ></Controller>
            </FormControl>

            <FormControl>
              <FormLabel>Assignee</FormLabel>

              <Controller
                control={methods.control}
                name="assignees.0"
                render={({ field }) => (
                  <Select
                    {...(field as any)}
                    value={field.value}
                    placeholder="Assignee"
                    startDecorator={
                      <Avatar
                        src={
                          getMembershipsQuery?.data?.find(
                            (one) => one?.id === field.value
                          )?.user?.picture || ''
                        }
                        size="sm"
                      />
                    }
                    onChange={(_, val) => {
                      if (val) {
                        field.onChange(val);
                      }
                    }}
                  >
                    {getMembershipsQuery?.data?.map((each) => (
                      <Option key={each.id} value={each.id}>
                        {each?.user?.name || each?.user?.email}
                      </Option>
                    ))}
                  </Select>
                )}
              ></Controller>
            </FormControl>
            <FormControl>
              <FormLabel>Contact</FormLabel>

              {query?.data?.participantsContacts?.map((each) => (
                <Stack key={each.id}>
                  <JoyInput
                    key={each.id}
                    endDecorator={<CopyButton text={each.email!} />}
                    variant="outlined"
                    value={each.email!}
                  ></JoyInput>
                </Stack>
              ))}
            </FormControl>

            <Divider />

            <Button
              color="danger"
              variant="plain"
              startDecorator={<DeleteRoundedIcon />}
              loading={deleteMutation.isMutating}
              onClick={async () => {
                const confirmed = confirm(
                  'All messages from this conversation will be deleted. Are you sure?'
                );

                if (confirmed) {
                  await deleteMutation.trigger();

                  onDeleteConversationSuccess?.();
                }
              }}
            >
              Delete Conversation
            </Button>
          </Stack>
        );
      }}
    </InboxConversationFormProvider>
  );
}

export default InboxConversationSettings;
