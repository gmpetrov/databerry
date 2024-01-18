import ArrowCircleUpRoundedIcon from '@mui/icons-material/ArrowCircleUpRounded';
import CorporateFareRoundedIcon from '@mui/icons-material/CorporateFareRounded';
import ErrorRoundedIcon from '@mui/icons-material/ErrorRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import TwitterIcon from '@mui/icons-material/Twitter';
import { Alert, Badge, CircularProgress } from '@mui/joy';
import Avatar from '@mui/joy/Avatar';
import Button from '@mui/joy/Button';
import Card from '@mui/joy/Card';
import Chip from '@mui/joy/Chip';
import Divider from '@mui/joy/Divider';
import Dropdown from '@mui/joy/Dropdown';
import FormControl from '@mui/joy/FormControl';
import FormHelperText from '@mui/joy/FormHelperText';
import FormLabel from '@mui/joy/FormLabel';
import LinearProgress from '@mui/joy/LinearProgress';
import Menu from '@mui/joy/Menu';
import MenuButton from '@mui/joy/MenuButton';
import MenuItem from '@mui/joy/MenuItem';
import Option from '@mui/joy/Option';
import Select from '@mui/joy/Select';
import Stack from '@mui/joy/Stack';
import { SxProps } from '@mui/joy/styles/types';
import Typography from '@mui/joy/Typography';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { signOut, useSession } from 'next-auth/react';
import React, { useEffect } from 'react';
import useSWR from 'swr';

import useProduct, { ProductType } from '@app/hooks/useProduct';
import { getOrganizations } from '@app/pages/api/organizations';

import accountConfig from '@chaindesk/lib/account-config';
import { fetcher } from '@chaindesk/lib/swr-fetcher';
import { RouteNames } from '@chaindesk/lib/types';
import { Prisma, SubscriptionPlan } from '@chaindesk/prisma';

import ColorSchemeToggle from '../Layout/ColorSchemeToggle';

import SelectOrganizationInput from './SelectOrganizationInput';

dayjs.extend(relativeTime);

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
      <Typography level="body-xs" sx={{ textAlign: 'right' }}>
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
  const { product } = useProduct();

  const targetOrgId = router.query?.targetOrgId as string;

  const handleSwitchOrg = React.useCallback(
    async (id: string) => {
      try {
        await session.update({
          orgId: id,
        });

        window.location.reload();
      } catch (err) {
        console.log(err);
      } finally {
      }
    },
    [session]
  );

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

  const sub = session?.data?.organization?.subscriptions?.[0];
  const isTrailing = sub?.status === 'trialing';
  const trialEndDate = sub?.cancel_at ? sub?.trial_end : undefined;

  return (
    <Stack gap={1}>
      {isTrailing && !!trialEndDate && (
        <Alert
          size="sm"
          color="warning"
          variant="outlined"
          startDecorator={<ErrorRoundedIcon fontSize="sm" />}
        >
          <Typography level="body-sm">
            Free trial ends{' '}
            <Typography color="warning">
              {dayjs(trialEndDate).from(Date.now())}
            </Typography>
          </Typography>
        </Alert>
      )}

      <SelectOrganizationInput />

      <Card variant="outlined" size="sm">
        <Stack gap={2}>
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

            {['chaindesk'].includes(product) && (
              <UsageGauge
                value={session?.data?.organization?.nbAgents || 0}
                max={
                  accountConfig?.[session?.data?.organization?.currentPlan!]
                    ?.limits?.maxAgents
                }
                label={'Agents'}
              />
            )}

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

      <Link href={RouteNames.BILLING} style={{ width: '100%' }}>
        <Button
          size="sm"
          color="warning"
          sx={(theme) => ({
            width: '100%',
            // background: theme.palette.warning[100],
            // color: theme.colorSchemes.light.palette.text.primary,
          })}
          startDecorator={<ArrowCircleUpRoundedIcon />}
          variant="solid"
        >
          Upgrade Plan
        </Button>
      </Link>

      {/* {!session?.data?.organization?.isPremium && (
        <Card size="sm">
          <Stack gap={1}>
            <Alert
              size="sm"
              color="danger"
              variant="soft"
              startDecorator={<ErrorRoundedIcon fontSize="sm" />}
            >
              Ending soon!
            </Alert>
            <Alert color="success" variant="solid">
              Share on social and get 30% off on your subscription!
            </Alert>
            <Stack direction="row" gap={1} sx={{ width: '100%' }}>
              <a
                target="_blank"
                className="w-full"
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`This is a game changer! 
      
      Chaindesk has transformed the way we handle customer queries with its next-gen AI native solution. Definitely a game-changer!
      
      Find out more: https://www.chaindesk.ai`)}`}
              >
                <Button
                  color="neutral"
                  variant="outlined"
                  sx={{ width: '100%' }}
                  startDecorator={<TwitterIcon />}
                >
                  Share
                </Button>
              </a>
              <a
                target="_blank"
                href={`https://www.linkedin.com/sharing/share-offsite/?url=https://www.chaindesk.ai`}
                className="w-full"
              >
                <Button
                  color="neutral"
                  variant="outlined"
                  sx={{ width: '100%' }}
                  startDecorator={<LinkedInIcon />}
                >
                  Share
                </Button>
              </a>
            </Stack>
          </Stack>
        </Card>
      )} */}
    </Stack>
  );
}

export default AccountCard;
