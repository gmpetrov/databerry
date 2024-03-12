import AllInboxRoundedIcon from '@mui/icons-material/AllInboxRounded';
import ApiRoundedIcon from '@mui/icons-material/ApiRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import AssistantRoundedIcon from '@mui/icons-material/AssistantRounded';
import ChatRoundedIcon from '@mui/icons-material/ChatRounded';
import ChecklistRoundedIcon from '@mui/icons-material/ChecklistRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import FeedRoundedIcon from '@mui/icons-material/FeedRounded';
import HelpRoundedIcon from '@mui/icons-material/HelpRounded';
import InboxRoundedIcon from '@mui/icons-material/InboxRounded';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import ManageAccountsRoundedIcon from '@mui/icons-material/ManageAccountsRounded';
import MarkChatUnreadRoundedIcon from '@mui/icons-material/MarkChatUnreadRounded';
import NewReleasesRoundedIcon from '@mui/icons-material/NewReleasesRounded';
import QuestionMarkIcon from '@mui/icons-material/QuestionMark';
import QuestionMarkRoundedIcon from '@mui/icons-material/QuestionMarkRounded';
import RecentActorsIcon from '@mui/icons-material/RecentActors';
import ReviewsRoundedIcon from '@mui/icons-material/ReviewsRounded';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import SmartToyRoundedIcon from '@mui/icons-material/SmartToyRounded'; // Icons import
import StorageRoundedIcon from '@mui/icons-material/StorageRounded';
import TwitterIcon from '@mui/icons-material/Twitter';
import WarningIcon from '@mui/icons-material/Warning';
import { ColorPaletteProp } from '@mui/joy';
import Alert from '@mui/joy/Alert';
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
import getConfig from 'next/config';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { signOut, useSession } from 'next-auth/react';
import * as React from 'react';
import toast from 'react-hot-toast';
import useSWR from 'swr';

import AccountCard from '@app/components/AccountCard';
import UserMenu from '@app/components/UserMenu';
import useModal from '@app/hooks/useModal';
import useProduct, { ProductType } from '@app/hooks/useProduct';
import { countUnread } from '@app/pages/api/logs/count-unread';
import { getStatus } from '@app/pages/api/status';

import { appUrl } from '@chaindesk/lib/config';
import { fetcher } from '@chaindesk/lib/swr-fetcher';
import { AppStatus, RouteNames } from '@chaindesk/lib/types';
import { Prisma } from '@chaindesk/prisma';

import SelectOrganizationInput from '../AccountCard/SelectOrganizationInput';
import StripePricingTable from '../StripePricingTable';
import UsageLimitModal from '../UsageLimitModal';

function NavigationLink(props: {
  href: string;
  target?: string;
  active?: boolean;
  icon?: React.ReactNode;
  label?: string | React.ReactElement;
  isExperimental?: boolean;
  isNew?: boolean;
}) {
  return (
    <Link key={props.href} href={props.href} target={props?.target}>
      <ListItem>
        <ListItemButton
          variant={props.active ? 'soft' : 'plain'}
          color={props.active ? 'primary' : 'neutral'}
        >
          <ListItemDecorator
            sx={{ color: props.active ? 'inherit' : 'neutral.500' }}
          >
            {props.icon}
          </ListItemDecorator>
          <ListItemContent>{props.label}</ListItemContent>

          <Stack direction="row" alignItems={'center'} sx={{ ml: 'auto' }}>
            {props.isNew && (
              <Chip
                className="text-white bg-gradient-to-r from-orange-500 via-red-500 to-red-500"
                size="sm"
              >
                new
              </Chip>
            )}

            {props.isExperimental && (
              <Chip
                className="text-white bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"
                size="sm"
              >
                beta
              </Chip>
              // <Chip
              //   startDecorator={<NewReleasesRoundedIcon />}
              //   size="sm"
              //   variant="soft"
              //   color="warning"
              // >
              //   Beta
              // </Chip>
            )}
          </Stack>
        </ListItemButton>
      </ListItem>
    </Link>
  );
}

export default function Navigation() {
  const router = useRouter();
  const { data: session } = useSession({
    required: true,
  });
  const { product } = useProduct();
  // const upgradeModal = useModal({
  //   disableClose: !session?.organization?.isPremium,
  // });

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
  const isMaintenance = !!getStatusQuery?.data?.isMaintenance;

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      if (
        window.location.hostname === 'app.databerry.ai' ||
        window.location.hostname === 'www.chaindesk.ai' ||
        window.location.hostname === 'chaindesk.ai'
      ) {
        window.location.href =
          'https://app.chaindesk.ai' + window.location.pathname;
      }
    }
  }, []);

  React.useEffect(() => {
    if (
      getStatusQuery?.data?.status &&
      getStatusQuery?.data?.status !== AppStatus.OK
    ) {
      toast.error(
        "We're experiencing some issues. Please try again later. Sorry for the inconvenience!",
        {
          duration: 100000,
          id: 'status-error',
        }
      );
    }
  }, [getStatusQuery?.data?.status]);

  // React.useEffect(() => {
  //   const timeout = setTimeout(() => {
  //     if (!session?.organization?.isPremium) {
  //       upgradeModal.open();
  //     } else {
  //       upgradeModal.close();
  //     }
  //   }, 5000);

  //   return () => {
  //     clearTimeout(timeout);
  //   };
  // }, [session?.organization?.isPremium]);

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

  const appLinks = React.useMemo(() => {
    return [
      ...(product === 'chaindesk'
        ? [
            {
              label: 'Inbox',
              route: RouteNames.LOGS,
              icon: (
                <Badge
                  badgeContent={countUnreadQuery?.data}
                  size="sm"
                  color="danger"
                  invisible={
                    !countUnreadQuery?.data || countUnreadQuery?.data <= 0
                  }
                >
                  <InboxRoundedIcon fontSize="md" />
                </Badge>
              ),
              active: router.route === RouteNames.LOGS,
              isNew: false,
            },
            {
              label: 'Agents',
              route: RouteNames.AGENTS,
              icon: <SmartToyRoundedIcon fontSize="md" />,
              active: router.route.startsWith(RouteNames.AGENTS),
              isExperimental: false,
              isNew: false,
            },
            {
              label: 'Datastores',
              route: RouteNames.DATASTORES,
              icon: <StorageRoundedIcon fontSize="md" />,
              active: router.route.startsWith(RouteNames.DATASTORES),
              isNew: false,
            },
            {
              label: 'Forms',
              route: RouteNames.FORMS,
              icon: <FeedRoundedIcon fontSize="md" />,
              active: router.route.startsWith(RouteNames.FORMS),
              isNew: false,
              isExperimental: true,
            },
            {
              label: 'Analytics',
              route: RouteNames.ANALYTICS,
              icon: <ShowChartIcon fontSize="md" />,
              active: router.route.startsWith(RouteNames.ANALYTICS),
              isNew: false,
            },
            {
              label: 'Email Inboxes',
              route: RouteNames.EMAIL_INBOXES,
              icon: <AllInboxRoundedIcon fontSize="small" />,
              active: router.route.startsWith(RouteNames.EMAIL_INBOXES),
              // isExperimental: true,
              isNew: false,
            },
            {
              label: 'Contacts',
              route: RouteNames.CONTACTS,
              icon: <RecentActorsIcon fontSize="md" />,
              active: router.route.startsWith(RouteNames.CONTACTS),
              isNew: false,
            },
          ]
        : []),
      ...(product === 'cs'
        ? [
            {
              label: 'Inbox',
              route: RouteNames.LOGS,
              icon: (
                <Badge
                  badgeContent={countUnreadQuery?.data}
                  size="sm"
                  color="danger"
                  invisible={
                    !countUnreadQuery?.data || countUnreadQuery?.data <= 0
                  }
                >
                  <InboxRoundedIcon fontSize="md" />
                </Badge>
              ),
              active: router.route === RouteNames.LOGS,
              isNew: false,
            },
            {
              label: 'Agents',
              route: RouteNames.AGENTS,
              icon: <SmartToyRoundedIcon fontSize="md" />,
              active: router.route.startsWith(RouteNames.AGENTS),
              isExperimental: false,
              isNew: false,
            },
          ]
        : []),
      ...(product === 'chat'
        ? [
            {
              label: 'Chat',
              route: RouteNames.CHAT,
              icon: <ChatRoundedIcon fontSize="md" />,
              active: router.route === RouteNames.CHAT,
              isExperimental: false,
              isNew: false,
            },
            {
              label: 'Datastores',
              route: RouteNames.DATASTORES,
              icon: <StorageRoundedIcon fontSize="md" />,
              active: router.route.startsWith(RouteNames.DATASTORES),
              isNew: false,
            },
          ]
        : []),
    ];
  }, [router.route, countUnreadQuery?.data, product]);

  const settingLinks = React.useMemo(() => {
    return [
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
        isExperimental: false,
        isNew: false,
      },
    ];
  }, [router.route]);

  const docLinks = React.useMemo(() => {
    return [
      {
        label: 'Help Center',
        route: 'https://chaindesk.ai/help',
        icon: <HelpRoundedIcon fontSize="small" />,
        target: 'blank',
        isExperimental: false,
        isNew: false,
      },
      {
        label: 'API Documentation',
        route: 'https://docs.chaindesk.ai/',
        icon: <ApiRoundedIcon fontSize="small" />,
        target: 'blank',
        isExperimental: false,
        isNew: false,
      },
    ];
  }, [router.route]);

  return (
    <Stack sx={{ height: '100%' }}>
      <List size="sm" sx={{ '--ListItem-radius': '8px' }}>
        <ListItem nested>
          {!!session?.user?.id && (
            <Head>
              <script
                id="chatbox"
                type="module"
                dangerouslySetInnerHTML={{
                  __html: `
                  import Chatbox from 'https://cdn.jsdelivr.net/npm/@chaindesk/embeds@latest/dist/chatbox/index.js';
                  // import Chatbox from 'http://localhost:8000/dist/chatbox/index.js';
                  try {
                  Chatbox.initBubble({
                      agentId: 'clq6g5cuv000wpv8iddswwvnd',
                      // agentId: 'clrz0tn6h000108kxfyomdzxg',
                      contact: {
                        userId: '${session?.user?.id}',
                        firstName: '${session?.user?.name || ''}',
                        email: '${session?.user?.email}',
                      },
                      context: '${JSON.stringify(`Task Bug Reporting: Use the following step-by-step to collect information about the bug and report it to the development team.
                      1- Please describe the bug in detail.
                      2- Please provide the steps to reproduce the bug.
                      3- Please provide the expected behavior.
                      4- Please provide your ressource ID (Agent ID or Datastore ID or Form ID)
                      5- Please share a screenshot or a video if possible.
                      6- Tell the user that the bug has been reported and that the development team will take care of it.
                      `)}',
                      interface: {
                        // iconUrl: 'https://www.chaindesk.ai/logo.png',
                        iconUrl: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Smilies/Love%20Letter.png',
                        position: 'right',
                        bubbleButtonStyle: {
                          width: '40px',
                          height: '40px',
                        },
                        bubbleIconStyle: {
                          // padding: '4px'
                          padding: '5px'
                        },
                        iconStyle: {
                          // padding: '7px'
                          padding: '5px'
                        },
                        isInitMessagePopupDisabled: true,
                        initialMessages: [
                          'Hello <strong>${
                            session?.user?.name || session?.user?.email || ''
                          }</strong> 👋',
                          'How can I help you ?',
                        ],
                        messageTemplates: [
                          "🐛 Bug Report",
                          "🤔 Missing Feature",
                          "❤️ I Love Chaindesk",
                        ]
                      } 
                    });

                  } catch (error) {
                    console.log(error)
                  }
                  `,
                }}
              />
            </Head>
          )}

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
            {appLinks.map((each) => (
              <NavigationLink
                key={each.route}
                href={each.route}
                active={each.active}
                icon={each.icon}
                label={each.label}
                isExperimental={each.isExperimental}
                isNew={each.isNew}
                target={(each as any).target}
              />
            ))}

            <Divider sx={{ my: 1 }} />

            {settingLinks.map((each) => (
              <NavigationLink
                key={each.route}
                href={each.route}
                active={each.active}
                icon={each.icon}
                label={each.label}
                isExperimental={each.isExperimental}
                isNew={each.isNew}
                target={(each as any).target}
              />
            ))}
            <Divider sx={{ my: 1 }} />
            {docLinks.map((each) => (
              <NavigationLink
                key={each.route}
                href={each.route}
                active={(each as any).active}
                icon={each.icon}
                label={each.label}
                isExperimental={each.isExperimental}
                isNew={each.isNew}
                target={(each as any).target}
              />
            ))}
            {(['chaindesk', 'cs', 'chat'] as ProductType[]).includes(
              product
            ) && (
              <>
                <Divider sx={{ my: 1 }} />
                <Typography
                  level="body-xs"
                  sx={{ mt: 1, mb: 1, ml: 1, fontStyle: 'italic' }}
                >
                  Other Products
                </Typography>

                {(['chaindesk', 'cs'] as ProductType[]).includes(product) && (
                  <Stack spacing={1}>
                    <Link
                      href={
                        process.env.NODE_ENV === 'production'
                          ? 'https://chat.chaindesk.ai/chat'
                          : 'http://chat.localhost:3000/chat'
                      }
                    >
                      <Button
                        sx={{ width: '100%' }}
                        className="font-title"
                        color="neutral"
                        variant="soft"
                        startDecorator={<ChatRoundedIcon fontSize="sm" />}
                        // endDecorator={
                        //   <Chip
                        //     className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"
                        //     size="sm"
                        //     sx={{
                        //       color: 'white',
                        //     }}
                        //   >
                        //     new
                        //   </Chip>
                        // }
                      >
                        Search Assistant
                      </Button>
                    </Link>
                  </Stack>
                )}
                {(['chat'] as ProductType[]).includes(product) && (
                  <Link
                    href={
                      process.env.NODE_ENV === 'production'
                        ? `${appUrl}/agents`
                        : 'http://localhost:3000/agents'
                    }
                  >
                    <Button
                      sx={{ width: '100%' }}
                      color="neutral"
                      variant="soft"
                      endDecorator={
                        <Chip
                          className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"
                          size="sm"
                          sx={{
                            color: 'white',
                          }}
                        >
                          new
                        </Chip>
                      }
                    >
                      Chaindesk Agents
                    </Button>
                  </Link>
                )}

                <Divider sx={{ my: 2 }} />
              </>
            )}
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

      {/* <Divider sx={{ my: 2 }}></Divider> */}

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

          {getStatusQuery?.data?.status && (
            <Link href={'https://status.chaindesk.ai/'} target={'_blank'}>
              <Chip
                color={
                  (
                    {
                      [AppStatus.OK]: 'success',
                      [AppStatus.WARNING]: 'warning',
                      [AppStatus.KO]: 'danger',
                    } as Record<AppStatus, ColorPaletteProp>
                  )[getStatusQuery?.data?.status]
                }
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
                      // bgcolor: isStatusOK ? 'success.300' : 'danger.500',
                      ...(getStatusQuery?.data?.status === AppStatus.OK && {
                        bgcolor: 'success.300',
                      }),
                      ...(getStatusQuery?.data?.status === AppStatus.KO && {
                        bgcolor: 'danger.500',
                      }),
                      ...(getStatusQuery?.data?.status ===
                        AppStatus.WARNING && {
                        bgcolor: 'warning.500',
                      }),
                    }}
                  />
                  <Typography level="body-sm">system status</Typography>
                </Stack>
              </Chip>
            </Link>
          )}
        </Stack>
      </Stack>

      <Divider sx={{ my: 2 }}></Divider>

      <UserMenu />

      {/* <UsageLimitModal isOpen={isShowUpgradeModal} handleClose={() => {}} /> */}
      {/* <upgradeModal.component
        dialogProps={{
          maxWidth: 'lg',
        }}
      >
        <Alert
          color="warning"
          variant="solid"
          startDecorator={
            <WarningIcon sx={{ mt: '2px', mx: '4px' }} fontSize="xl2" />
          }
        >
          Choose a plan in order to access the platform
        </Alert>

        <Stack spacing={1}>
          <Typography level="body-md">Organization</Typography>
          <SelectOrganizationInput />
        </Stack>

        <Stack sx={{ py: 4 }}>
          <StripePricingTable />
        </Stack>
      </upgradeModal.component> */}
    </Stack>
  );
}
