import ApiRoundedIcon from '@mui/icons-material/ApiRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import ChatRoundedIcon from '@mui/icons-material/ChatRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import HelpRoundedIcon from '@mui/icons-material/HelpRounded';
import InboxRoundedIcon from '@mui/icons-material/InboxRounded';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import ManageAccountsRoundedIcon from '@mui/icons-material/ManageAccountsRounded';
import NewReleasesRoundedIcon from '@mui/icons-material/NewReleasesRounded';
import QuestionMarkRoundedIcon from '@mui/icons-material/QuestionMarkRounded';
import SmartToyRoundedIcon from '@mui/icons-material/SmartToyRounded'; // Icons import
import StorageRoundedIcon from '@mui/icons-material/StorageRounded';
import TwitterIcon from '@mui/icons-material/Twitter';
import Badge from '@mui/joy/Badge';
import Box from '@mui/joy/Box';
import Button from '@mui/joy/Button';
import Chip from '@mui/joy/Chip';
import Divider from '@mui/joy/Divider';
import IconButton from '@mui/joy/IconButton';
import List from '@mui/joy/List';
import ListItem from '@mui/joy/ListItem';
import ListItemButton from '@mui/joy/ListItemButton';
import ListItemContent from '@mui/joy/ListItemContent';
import ListItemDecorator from '@mui/joy/ListItemDecorator';
import Stack from '@mui/joy/Stack';
import SvgIcon from '@mui/joy/SvgIcon';
import Typography from '@mui/joy/Typography';
import { Prisma } from '@prisma/client';
import getConfig from 'next/config';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { signOut, useSession } from 'next-auth/react';
import * as React from 'react';
import toast from 'react-hot-toast';
import useSWR from 'swr';

import AccountCard from '@app/components/AccountCard';
import UserMenu from '@app/components/UserMenu';
import { countUnread } from '@app/pages/api/logs/count-unread';
import { getStatus } from '@app/pages/api/status';
import { AppStatus, RouteNames } from '@app/types';
import { fetcher } from '@app/utils/swr-fetcher';

export default function Navigation() {
  const router = useRouter();
  const { data: session } = useSession();

  const getStatusQuery = useSWR<Prisma.PromiseReturnType<typeof getStatus>>(
    '/api/status',
    fetcher,
    {
      refreshInterval: 60000,
    }
  );

  const countUnreadQuery = useSWR<Prisma.PromiseReturnType<typeof countUnread>>(
    '/api/logs/count-unread',
    fetcher,
    {
      refreshInterval: 60000,
    }
  );

  const { publicRuntimeConfig } = getConfig();
  const isStatusOK = getStatusQuery?.data?.status === AppStatus.OK;
  const isMaintenance = !!getStatusQuery?.data?.isMaintenance;

  React.useEffect(() => {
    if (
      isMaintenance &&
      router.route !== RouteNames.MAINTENANCE &&
      router.route !== '/'
    ) {
      router.push(RouteNames.MAINTENANCE);
    }
  }, [isMaintenance]);

  React.useEffect(() => {
    if (
      publicRuntimeConfig?.version &&
      getStatusQuery?.data?.latestVersion &&
      publicRuntimeConfig?.version !== getStatusQuery?.data?.latestVersion
    ) {
      toast(
        (t) => (
          <Stack
            direction={'row'}
            sx={{
              alignItems: 'center',
            }}
            gap={2}
            width={'100%'}
          >
            <IconButton
              size="sm"
              variant="plain"
              color="neutral"
              onClick={() => toast.dismiss(t.id)}
            >
              <CloseRoundedIcon />
            </IconButton>
            <p className="font-bold whitespace-nowrap">New version available</p>
            <Button
              size="sm"
              onClick={() => {
                window?.location?.reload?.();
              }}
            >
              Update
            </Button>
          </Stack>
        ),
        {
          duration: 10000,
        }
      );
    }
  }, [publicRuntimeConfig?.version, getStatusQuery?.data?.latestVersion]);

  const items = React.useMemo(() => {
    return [
      {
        label: 'Agents',
        route: RouteNames.AGENTS,
        icon: <SmartToyRoundedIcon fontSize="md" />,
        active: router.route.startsWith(RouteNames.AGENTS),
        isExperimental: false,
      },
      {
        label: 'Datastores',
        route: RouteNames.DATASTORES,
        icon: <StorageRoundedIcon fontSize="md" />,
        active: router.route.startsWith(RouteNames.DATASTORES),
      },
      {
        label: 'Chat',
        route: RouteNames.CHAT,
        icon: <ChatRoundedIcon fontSize="md" />,
        active: router.route === RouteNames.CHAT,
        isExperimental: true,
      },
      {
        label: 'Logs',
        route: RouteNames.LOGS,
        icon: (
          <Badge
            badgeContent={countUnreadQuery?.data}
            size="sm"
            color="danger"
            invisible={!countUnreadQuery?.data || countUnreadQuery?.data <= 0}
          >
            <InboxRoundedIcon fontSize="md" />
          </Badge>
        ),
        active: router.route === RouteNames.LOGS,
      },

      // {
      //   label: 'Apps',
      //   route: RouteNames.APPS,
      //   icon: <AutoFixHighRoundedIcon fontSize="small" />,
      //   active: router.route === RouteNames.APPS,
      // },
      {
        label: 'Settings',
        route: RouteNames.SETTINGS,
        icon: <ManageAccountsRoundedIcon fontSize="small" />,
        active: router.route.startsWith(RouteNames.SETTINGS),
      },
      {
        label: 'Help Center',
        route: 'https://chaindesk.ai/help',
        icon: <HelpRoundedIcon fontSize="small" />,
        target: 'blank',
      },
      {
        label: 'API Documentation',
        route: 'https://docs.chaindesk.ai/',
        icon: <ApiRoundedIcon fontSize="small" />,
        target: 'blank',
      },
    ];
  }, [router.route, countUnreadQuery?.data]);

  return (
    <Stack sx={{ height: '100%' }}>
      <List size="sm" sx={{ '--ListItem-radius': '8px' }}>
        <ListItem nested>
          {/* <ListSubheader>
          Browse
          <IconButton
            size="sm"
            variant="plain"
            color="primary"
            sx={{ '--IconButton-size': '24px', ml: 'auto' }}
          >
            <KeyboardArrowDownRoundedIcon fontSize="small" color="primary" />
          </IconButton>
        </ListSubheader> */}
          <List
            aria-labelledby="nav-list-browse"
            sx={{
              '& .JoyListItemButton-root': { p: '8px' },
            }}
          >
            {items.map((each) => (
              <Link key={each.route} href={each.route} target={each?.target}>
                <ListItem>
                  <ListItemButton
                    variant={each.active ? 'soft' : 'plain'}
                    color={each.active ? 'primary' : 'neutral'}
                  >
                    <ListItemDecorator
                      sx={{ color: each.active ? 'inherit' : 'neutral.500' }}
                    >
                      {each.icon}
                    </ListItemDecorator>
                    <ListItemContent>{each.label}</ListItemContent>

                    {each.isExperimental && (
                      <Chip
                        startDecorator={<NewReleasesRoundedIcon />}
                        size="sm"
                        variant="soft"
                        color="warning"
                      >
                        Beta
                      </Chip>
                    )}
                  </ListItemButton>
                </ListItem>
              </Link>
            ))}
          </List>
        </ListItem>
        {/* <ListItem nested sx={{ mt: 2 }}>
        <ListSubheader>
          Tags
          <IconButton
            size="sm"
            variant="plain"
            color="primary"
            sx={{ '--IconButton-size': '24px', ml: 'auto' }}
          >
            <KeyboardArrowDownRoundedIcon fontSize="small" color="primary" />
          </IconButton>
        </ListSubheader>
        <List
          aria-labelledby="nav-list-tags"
          size="sm"
          sx={{
            '--ListItemDecorator-size': '32px',
            '& .JoyListItemButton-root': { p: '8px' },
          }}
        >
          <ListItem>
            <ListItemButton>
              <ListItemDecorator>
                <Box
                  sx={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '99px',
                    bgcolor: 'primary.300',
                  }}
                />
              </ListItemDecorator>
              <ListItemContent>Personal</ListItemContent>
            </ListItemButton>
          </ListItem>
          <ListItem>
            <ListItemButton>
              <ListItemDecorator>
                <Box
                  sx={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '99px',
                    bgcolor: 'danger.300',
                  }}
                />
              </ListItemDecorator>
              <ListItemContent>Work</ListItemContent>
            </ListItemButton>
          </ListItem>
          <ListItem>
            <ListItemButton>
              <ListItemDecorator>
                <Box
                  sx={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '99px',
                    bgcolor: 'warning.200',
                  }}
                />
              </ListItemDecorator>
              <ListItemContent>Travels</ListItemContent>
            </ListItemButton>
          </ListItem>
          <ListItem>
            <ListItemButton>
              <ListItemDecorator>
                <Box
                  sx={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '99px',
                    bgcolor: 'success.300',
                  }}
                />
              </ListItemDecorator>
              <ListItemContent>Concert tickets</ListItemContent>
            </ListItemButton>
          </ListItem>
        </List>
      </ListItem> */}
      </List>

      <AccountCard />

      <Divider sx={{ my: 2 }}></Divider>

      <Stack gap={1}>
        <Stack direction="row" justifyContent={'center'} gap={1}>
          <Link href="https://twitter.com/chaindesk_ai" target="_blank">
            <IconButton variant="plain" size="sm" color="neutral">
              <TwitterIcon />
            </IconButton>
          </Link>
          <Link
            href="https://www.linkedin.com/company/chaindesk"
            target="_blank"
          >
            <IconButton variant="plain" size="sm" color="neutral">
              <LinkedInIcon />
            </IconButton>
          </Link>
          <Link href="https://discord.com/invite/FSWKj49ckX" target="_blank">
            <IconButton variant="plain" size="sm" color="neutral">
              <SvgIcon>
                <svg
                  viewBox="0 -28.5 256 256"
                  version="1.1"
                  xmlns="http://www.w3.org/2000/svg"
                  preserveAspectRatio="xMidYMid"
                  fill="currentColor"
                >
                  <g>
                    <path
                      d="M216.856339,16.5966031 C200.285002,8.84328665 182.566144,3.2084988 164.041564,0 C161.766523,4.11318106 159.108624,9.64549908 157.276099,14.0464379 C137.583995,11.0849896 118.072967,11.0849896 98.7430163,14.0464379 C96.9108417,9.64549908 94.1925838,4.11318106 91.8971895,0 C73.3526068,3.2084988 55.6133949,8.86399117 39.0420583,16.6376612 C5.61752293,67.146514 -3.4433191,116.400813 1.08711069,164.955721 C23.2560196,181.510915 44.7403634,191.567697 65.8621325,198.148576 C71.0772151,190.971126 75.7283628,183.341335 79.7352139,175.300261 C72.104019,172.400575 64.7949724,168.822202 57.8887866,164.667963 C59.7209612,163.310589 61.5131304,161.891452 63.2445898,160.431257 C105.36741,180.133187 151.134928,180.133187 192.754523,160.431257 C194.506336,161.891452 196.298154,163.310589 198.110326,164.667963 C191.183787,168.842556 183.854737,172.420929 176.223542,175.320965 C180.230393,183.341335 184.861538,190.991831 190.096624,198.16893 C211.238746,191.588051 232.743023,181.531619 254.911949,164.955721 C260.227747,108.668201 245.831087,59.8662432 216.856339,16.5966031 Z M85.4738752,135.09489 C72.8290281,135.09489 62.4592217,123.290155 62.4592217,108.914901 C62.4592217,94.5396472 72.607595,82.7145587 85.4738752,82.7145587 C98.3405064,82.7145587 108.709962,94.5189427 108.488529,108.914901 C108.508531,123.290155 98.3405064,135.09489 85.4738752,135.09489 Z M170.525237,135.09489 C157.88039,135.09489 147.510584,123.290155 147.510584,108.914901 C147.510584,94.5396472 157.658606,82.7145587 170.525237,82.7145587 C183.391518,82.7145587 193.761324,94.5189427 193.539891,108.914901 C193.539891,123.290155 183.391518,135.09489 170.525237,135.09489 Z"
                      fillRule="nonzero"
                    ></path>
                  </g>
                </svg>
              </SvgIcon>
            </IconButton>
          </Link>
        </Stack>
        <Link href="mailto:support@chaindesk.ai" className="mx-auto">
          <Typography level="body-sm" mx={'auto'}>
            support@chaindesk.ai
          </Typography>
        </Link>

        <Stack direction="row" sx={{ justifyContent: 'center', gap: 1 }}>
          <Chip color="neutral" variant="soft">
            v{publicRuntimeConfig?.version}
          </Chip>

          <Link href={'https://status.chaindesk.ai/'} target={'_blank'}>
            <Chip
              color={isStatusOK ? 'success' : 'danger'}
              variant="soft"
              sx={{ cursor: 'pointer' }}
              endDecorator={<ArrowForwardRoundedIcon />}
            >
              <Stack direction="row" alignItems={'center'} gap={1}>
                <Box
                  sx={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '99px',
                    bgcolor: isStatusOK ? 'success.300' : 'danger.500',
                  }}
                />
                <Typography level="body-sm">system status</Typography>
              </Stack>
            </Chip>
          </Link>
        </Stack>
      </Stack>

      <Divider sx={{ my: 2 }}></Divider>

      <UserMenu />
    </Stack>
  );
}
