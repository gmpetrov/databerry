import ArrowCircleUpRoundedIcon from '@mui/icons-material/ArrowCircleUpRounded';
import CorporateFareRoundedIcon from '@mui/icons-material/CorporateFareRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import { CircularProgress } from '@mui/joy';
import Avatar from '@mui/joy/Avatar';
import Button from '@mui/joy/Button';
import Card from '@mui/joy/Card';
import Chip from '@mui/joy/Chip';
import Divider from '@mui/joy/Divider';
import FormControl from '@mui/joy/FormControl';
import FormHelperText from '@mui/joy/FormHelperText';
import FormLabel from '@mui/joy/FormLabel';
import LinearProgress from '@mui/joy/LinearProgress';
import Menu from '@mui/joy/Menu';
import MenuItem from '@mui/joy/MenuItem';
import Option from '@mui/joy/Option';
import Select from '@mui/joy/Select';
import Stack from '@mui/joy/Stack';
import { SxProps } from '@mui/joy/styles/types';
import Typography from '@mui/joy/Typography';
import { Prisma, SubscriptionPlan } from '@prisma/client';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { signOut, useSession } from 'next-auth/react';
import React, { useEffect } from 'react';
import useSWR from 'swr';

import { getOrganizations } from '@app/pages/api/organizations';
import { RouteNames } from '@app/types';
import accountConfig from '@app/utils/account-config';
import { fetcher } from '@app/utils/swr-fetcher';

import ColorSchemeToggle from './Layout/ColorSchemeToggle';

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

const UsageGauge = (props: {
  value: number;
  max: number;
  label?: string;
  fixed?: number;
}) => {
  const rate = (props.value / props.max) * 100;

  return (
    <Stack width={'100%'} gap={1}>
      <Typography level="body3" sx={{ textAlign: 'right' }}>
        {`${(props.value || 0).toFixed(props.fixed || 0)} / ${props.max} ${
          props.label
        }`}
      </Typography>
      <LinearProgress
        determinate
        color={rate >= 80 ? 'danger' : 'neutral'}
        value={rate}
        sx={{ overflow: 'hidden' }}
      />
    </Stack>
  );
};

type Props = {};
function AccountCard({}: Props) {
  const router = useRouter();
  const session = useSession();

  const targetOrgId = router.query?.targetOrgId as string;

  const getOrgsQuery = useSWR<
    Prisma.PromiseReturnType<typeof getOrganizations>
  >('/api/organizations', fetcher);
  const [isCreatingOrg, setIsCreatingOrg] = React.useState(false);

  const [
    userMenuElement,
    setUserMenuElement,
  ] = React.useState<null | HTMLElement>(null);

  const [isUpdatingSession, setIsUpdatingSession] = React.useState(false);

  const openUserMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    setUserMenuElement(event.currentTarget);
  };

  const closeUserMenu = () => {
    setUserMenuElement(null);
  };

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

  const handleCreateOrg = React.useCallback(async () => {
    try {
      setIsCreatingOrg(true);

      await fetch('/api/organizations', {
        method: 'POST',
      });

      getOrgsQuery.mutate();
    } catch {
    } finally {
      setIsCreatingOrg(false);
    }
  }, []);

  useEffect(() => {
    (async () => {
      if (
        targetOrgId &&
        targetOrgId !== session?.data?.organization?.id &&
        session?.data?.user?.memberships?.find(
          (one) => one.organizationId === targetOrgId
        )
      ) {
        delete router.query.targetOrgId;
        router.replace(router, undefined, { shallow: true });
        handleSwitchOrg(targetOrgId);
      }
    })();
  }, [targetOrgId, session?.data?.organization?.id, handleSwitchOrg]);

  const isMenuOpen = Boolean(userMenuElement);

  return (
    <Stack gap={1}>
      <FormControl>
        <Select
          disabled={isUpdatingSession}
          value={session?.data?.organization?.id}
          placeholder={'Select a Team'}
          endDecorator={
            isUpdatingSession ? <CircularProgress size="sm" /> : null
          }
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

          {/* <Divider sx={{ my: 1 }} />
          <Button
            sx={{ mx: 1 }}
            size="sm"
            onClick={handleCreateOrg}
            loading={isCreatingOrg}
          >
            New Team
          </Button> */}
        </Select>
      </FormControl>

      <Card variant="outlined" size="sm">
        <Stack gap={2}>
          <Stack
            direction="row"
            justifyContent={'space-between'}
            alignItems={'start'}
            gap={1}
          >
            <Button
              onClick={openUserMenu as any}
              id="basic-demo-button"
              aria-controls={isMenuOpen ? 'basic-menu' : undefined}
              aria-haspopup="true"
              aria-expanded={isMenuOpen ? 'true' : undefined}
              variant="plain"
              size={'sm'}
              color="neutral"
              sx={{
                flexDirection: 'row',
                display: 'flex',
                gap: 1,
                width: '100%',
                maxWidth: '100%',
                justifyContent: 'space-between',
                // borderRadius: 99,
              }}
              className="truncate"
              endDecorator={<ExpandMoreRoundedIcon />}
            >
              <Avatar
                size="sm"
                src={session?.data?.user?.image!}
                sx={{
                  ':hover': {
                    cursor: 'pointer',
                  },
                }}
              />

              <Typography
                className="truncate"
                sx={{ maxWidth: '100%' }}
                level="body2"
              >
                {session?.data?.user?.name || session?.data?.user?.email}
              </Typography>
            </Button>

            <Menu
              id="basic-menu"
              anchorEl={userMenuElement}
              open={isMenuOpen}
              onClose={closeUserMenu}
              aria-labelledby="basic-demo-button"
              placement="bottom-start"
              sx={(theme) => ({
                zIndex: theme.zIndex.tooltip,
              })}
            >
              <MenuItem>{session?.data?.user?.email}</MenuItem>
              <Divider />
              <MenuItem onClick={() => signOut()}>Logout</MenuItem>
            </Menu>

            <ColorSchemeToggle />
          </Stack>
          <Stack gap={1}>
            <UsageGauge
              value={session?.data?.organization?.usage?.nbAgentQueries || 0}
              max={
                accountConfig?.[session?.data?.organization?.currentPlan!]
                  ?.limits?.maxAgentsQueries
              }
              label={'Queries'}
            />
            <UsageGauge
              value={
                (session?.data?.organization?.usage?.nbStoredTokens || 0) /
                1000000
              }
              max={
                accountConfig?.[session?.data?.organization?.currentPlan!]
                  ?.limits?.maxStoredTokens / 1000000
              }
              label={'Million words stored'}
              fixed={3}
            />
            <UsageGauge
              value={session?.data?.organization?.nbAgents || 0}
              max={
                accountConfig?.[session?.data?.organization?.currentPlan!]
                  ?.limits?.maxAgents
              }
              label={'Agents'}
            />

            <UsageGauge
              value={session?.data?.organization?.nbDatastores || 0}
              max={
                accountConfig?.[session?.data?.organization?.currentPlan!]
                  ?.limits?.maxDatastores
              }
              label={'Datastores'}
            />
          </Stack>
        </Stack>
      </Card>

      <Link href={RouteNames.ACCOUNT} style={{ width: '100%' }}>
        <Button
          size="sm"
          color="warning"
          sx={(theme) => ({
            width: '100%',
            // background: theme.palette.warning[100],
            // color: theme.colorSchemes.light.palette.text.primary,
          })}
          startDecorator={<ArrowCircleUpRoundedIcon />}
          variant="soft"
        >
          Upgrade Plan
        </Button>
      </Link>
    </Stack>
  );
}

export default AccountCard;
