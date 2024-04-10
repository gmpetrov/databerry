import AccessTimeIcon from '@mui/icons-material/AccessTime';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import MessageRoundedIcon from '@mui/icons-material/MessageRounded';
import PublicIcon from '@mui/icons-material/Public';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import {
  ColorPaletteProp,
  Divider,
  FormControl,
  FormLabel,
  Tooltip,
  Typography,
} from '@mui/joy';
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
import { getMemberships } from '@app/pages/api/memberships';

import getCurrentTimeInTimezone from '@chaindesk/lib/currentTimeInTimezone';
import formatPhoneNumber from '@chaindesk/lib/format-phone-number';
import { fetcher } from '@chaindesk/lib/swr-fetcher';
import {
  ConversationChannel,
  ConversationStatus,
  Prisma,
} from '@chaindesk/prisma';
import CopyButton from '@chaindesk/ui/CopyButton';

import { convertToCountryName } from '../charts/GeoChart';
import InboxConversationFormProvider from '../InboxConversationFormProvider';

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

  const location =
    query?.data?.participantsContacts?.[0]?.metadata ||
    query?.data?.participantsVisitors?.[0]?.metadata;

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
            <Divider />

            {location && (
              <>
                <Stack gap={1}>
                  <FormLabel>Location</FormLabel>
                  {(location as any)?.country && (
                    <Stack direction="row">
                      <Tooltip
                        title="Visitor's City and Country"
                        variant="soft"
                        placement="top-start"
                      >
                        <Typography
                          alignItems="center"
                          justifyItems="center"
                          level="body-sm"
                          startDecorator={<LocationOnIcon fontSize="lg" />}
                        >
                          {(location as any)?.city &&
                            `${(location as any)?.city}, `}

                          {convertToCountryName((location as any)?.country) ??
                            (location as any)?.country}
                        </Typography>
                      </Tooltip>
                    </Stack>
                  )}

                  {(location as any)?.timezone && (
                    <>
                      <Tooltip
                        title="Visitor's timezone"
                        variant="soft"
                        placement="top-start"
                      >
                        <Typography
                          alignItems="center"
                          justifyItems="center"
                          level="body-sm"
                          startDecorator={<PublicIcon fontSize="lg" />}
                        >
                          {(location as any)?.timezone}
                        </Typography>
                      </Tooltip>

                      <Tooltip
                        title="Visitor's time"
                        variant="soft"
                        placement="top-start"
                      >
                        <Typography
                          alignItems="center"
                          justifyItems="center"
                          level="body-sm"
                          startDecorator={<AccessTimeIcon fontSize="lg" />}
                        >
                          {getCurrentTimeInTimezone(
                            (location as any)?.timezone
                          )}
                        </Typography>
                      </Tooltip>
                    </>
                  )}
                </Stack>
                <Divider />
              </>
            )}

            {!!query?.data?.participantsContacts?.length && (
              <>
                <FormControl>
                  <FormLabel>Contact</FormLabel>

                  <Stack gap={1}>
                    {query?.data?.participantsContacts?.map((each) => (
                      <Stack key={each.id} gap={1}>
                        {each.email && (
                          <JoyInput
                            endDecorator={<CopyButton text={each.email!} />}
                            variant="outlined"
                            value={each.email!}
                          ></JoyInput>
                        )}
                        {each?.phoneNumber && (
                          <JoyInput
                            endDecorator={
                              <CopyButton
                                text={formatPhoneNumber({
                                  phoneNumber: each?.phoneNumber,
                                })}
                              />
                            }
                            variant="outlined"
                            value={formatPhoneNumber({
                              phoneNumber: each?.phoneNumber,
                            })}
                          ></JoyInput>
                        )}
                      </Stack>
                    ))}
                  </Stack>
                </FormControl>
                <Divider />
              </>
            )}

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
