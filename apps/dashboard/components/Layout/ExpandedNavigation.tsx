import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import ChatRoundedIcon from '@mui/icons-material/ChatRounded';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import TwitterIcon from '@mui/icons-material/Twitter';
import {
  Box,
  Button,
  Chip,
  ColorPaletteProp,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemContent,
  ListItemDecorator,
  Stack,
  SvgIcon,
  Typography,
} from '@mui/joy';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

import { ProductType } from '@app/hooks/useProduct';

import { appUrl } from '@chaindesk/lib/config';
import { AppStatus, RouteNames } from '@chaindesk/lib/types';
import DarkModeToggle from '@chaindesk/ui/DarkModeToggle';

import AccountCard from '../AccountCard';
import UserMenu from '../UserMenu';

export type AppLink =
  | {
      label: string;
      route: RouteNames;
      icon: JSX.Element;
      active: boolean;
      isNew: boolean;
      isExperimental?: undefined;
    }
  | {
      label: string;
      route: RouteNames;
      icon: JSX.Element;
      active: boolean;
      isExperimental: boolean;
      isNew: boolean;
    };

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
            )}
          </Stack>
        </ListItemButton>
      </ListItem>
    </Link>
  );
}

export default function ExpandedNavigation({
  product,
  appLinks,
  settingLinks,
  docLinks,
  publicRuntimeConfig,
  status,
}: {
  product: ProductType;
  appLinks: AppLink[];
  settingLinks: AppLink[];
  docLinks: AppLink[];
  status: AppStatus | undefined;
  publicRuntimeConfig: Record<string, unknown> & { version?: string };
}) {
  const { data: session } = useSession({
    required: true,
  });
  return (
    <>
      <Stack
        className="h-full px-4 overflow-y-auto"
        bgcolor="background.surface"
      >
        <List size="sm" sx={{ '--ListItem-radius': '8px' }}>
          <Stack
            direction="row"
            width="100%"
            gap={1}
            justifyContent="space-between"
            justifyItems="center"
            paddingTop={1}
            paddingBottom={1}
          >
            <Stack direction="row" alignItems="center" gap={1.5}>
              <div className="relative w-5 h-5 mt-[0.5px] flex justify-center ">
                <Image layout="fill" src="/logo.png" alt="Chaindesk" />
              </div>
              <Typography level="title-md">Chaindesk</Typography>
            </Stack>
            <DarkModeToggle variant="plain" color="neutral" />
          </Stack>

          <Divider sx={{ mb: 1 }} />

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
                // context: '${JSON.stringify(`Task Bug Reporting: Use the following step-by-step to collect information about the bug and report it to the development team.
                // 1- Please describe the bug in detail.
                // 2- Please provide the steps to reproduce the bug.
                // 3- Please provide the expected behavior.
                // 4- Please provide your ressource ID (Agent ID or Datastore ID or Form ID)
                // 5- Please share a screenshot or a video if possible.
                // 6- Tell the user that the bug has been reported and that the development team will take care of it.
                // `)}',
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
                    "💬 Product Feedback",
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
        </List>

        <AccountCard />

        <Divider sx={{ my: 2 }} />

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
              {publicRuntimeConfig?.version}
            </Chip>

            {status && (
              <Link
                href={'https://status.chaindesk.ai/'}
                target={'_blank'}
                className={!open ? 'fixed bottom-2' : ''}
              >
                <Chip
                  color={
                    (
                      {
                        [AppStatus.OK]: 'success',
                        [AppStatus.WARNING]: 'warning',
                        [AppStatus.KO]: 'danger',
                      } as Record<AppStatus, ColorPaletteProp>
                    )[status]
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
                        ...(status === AppStatus.OK && {
                          bgcolor: 'success.300',
                        }),
                        ...(status === AppStatus.KO && {
                          bgcolor: 'danger.500',
                        }),
                        ...(status === AppStatus.WARNING && {
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

        <Divider sx={{ my: 2 }} />

        <UserMenu />
      </Stack>
      {<Divider orientation="vertical" />}
    </>
  );
}
