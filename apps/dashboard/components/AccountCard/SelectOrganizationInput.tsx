import CorporateFareRoundedIcon from '@mui/icons-material/CorporateFareRounded';
import { CircularProgress } from '@mui/joy';
import Avatar from '@mui/joy/Avatar';
import Chip from '@mui/joy/Chip';
import FormControl from '@mui/joy/FormControl';
import Option from '@mui/joy/Option';
import Select from '@mui/joy/Select';
import Stack from '@mui/joy/Stack';
import { SxProps } from '@mui/joy/styles/types';
import Typography from '@mui/joy/Typography';
import { useSession } from 'next-auth/react';
import React from 'react';
import useSWR from 'swr';

import { getOrganizations } from '@app/pages/api/organizations';

import accountConfig from '@chaindesk/lib/account-config';
import { fetcher } from '@chaindesk/lib/swr-fetcher';
import { Prisma, SubscriptionPlan } from '@chaindesk/prisma';
type Props = {};

type RenderOrgOptionProps = {
  name: string;
  plan?: SubscriptionPlan;
  avatarUrl?: string;
  rootSxProps?: SxProps;
};

const RenderOrgOption = (props: RenderOrgOptionProps) => {
  const planLabel = accountConfig?.[props?.plan!]?.label;
  return (
    <Stack
      direction="row"
      sx={{ alignItems: 'center', width: '100%', ...props.rootSxProps }}
      gap={1}
    >
      <Avatar size="sm" src={props.avatarUrl}>
        <CorporateFareRoundedIcon />
      </Avatar>
      <Typography className="truncate">{props.name} </Typography>
      {planLabel && (
        <Chip size="sm" variant="outlined" color="warning" sx={{ ml: 'auto' }}>
          {planLabel}
        </Chip>
      )}
    </Stack>
  );
};

function SelectOrganizationInput({}: Props) {
  const session = useSession();

  const [isUpdatingSession, setIsUpdatingSession] = React.useState(false);
  const getOrgsQuery = useSWR<
    Prisma.PromiseReturnType<typeof getOrganizations>
  >('/api/organizations', fetcher);

  const handleSwitchOrg = React.useCallback(
    async (id: string) => {
      try {
        setIsUpdatingSession(true);

        await session.update({
          orgId: id,
        });

        window.location.reload();
      } catch (err) {
        console.log(err);
      } finally {
        setIsUpdatingSession(false);
      }
    },
    [session]
  );

  return (
    <FormControl>
      <Select
        disabled={isUpdatingSession}
        value={session?.data?.organization?.id}
        placeholder={'Select a Team'}
        endDecorator={isUpdatingSession ? <CircularProgress size="sm" /> : null}
        renderValue={(option) => {
          const org = getOrgsQuery?.data?.find(
            (one) => one.id === option?.value
          );

          return (
            <RenderOrgOption
              name={org?.name!}
              plan={org?.subscriptions?.[0]?.plan!}
              avatarUrl={
                org?.iconUrl ? `${org?.iconUrl}?timestamp=${Date.now()}` : ''
              }
            />
          );
        }}
        onChange={(_, value) => handleSwitchOrg(value as string)}
      >
        {getOrgsQuery?.data?.map((org) => (
          <Option key={org.id} value={org.id}>
            <RenderOrgOption
              rootSxProps={{ maxWidth: '250px' }}
              name={org?.name!}
              plan={org?.subscriptions?.[0]?.plan!}
              avatarUrl={
                org?.iconUrl ? `${org?.iconUrl}?timestamp=${Date.now()}` : ''
              }
            />
          </Option>
        ))}
      </Select>
    </FormControl>
  );
}

export default SelectOrganizationInput;
