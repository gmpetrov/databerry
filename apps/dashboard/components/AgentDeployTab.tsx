import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ToggleOffIcon from '@mui/icons-material/ToggleOff';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';
import { IconButton, List, ListItem } from '@mui/joy';
import Button from '@mui/joy/Button';
import Chip from '@mui/joy/Chip';
import Stack from '@mui/joy/Stack';
import Typography from '@mui/joy/Typography';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import React from 'react';

import useModal from '@app/hooks/useModal';

import { AgentVisibility, DatastoreVisibility } from '@chaindesk/prisma';
import useAgent from '@chaindesk/ui/hooks/useAgent';
import useStateReducer from '@chaindesk/ui/hooks/useStateReducer';

import SettingCard from './ui/SettingCard';
import UsageLimitModal from './UsageLimitModal';

const SlackBotModal = dynamic(
  () => import('@app/components/SlackSettingsModal'),
  {
    ssr: false,
  }
);

const CrispSettingsModal = dynamic(
  () => import('@app/components/CrispSettingsModal'),
  {
    ssr: false,
  }
);

const IFrameWidgetSettings = dynamic(
  () => import('@app/components/IFrameWidgetSettings'),
  {
    ssr: false,
  }
);

const BubbleWidgetSettings = dynamic(
  () => import('@app/components/BubbleWidgetSettings'),
  {
    ssr: false,
  }
);

const StandalonePageWidgetSettings = dynamic(
  () => import('@app/components/StandalonePageWidgetSettings'),
  {
    ssr: false,
  }
);
const ZendeskSettings = dynamic(
  () => import('@app/components/ZendeskSettings'),
  {
    ssr: false,
  }
);

const ShopifySettings = dynamic(
  () => import('@app/components/ShopifySettings'),
  {
    ssr: false,
  }
);

const WhatsAppSettings = dynamic(
  () => import('@app/components/WhatsAppSettings'),
  {
    ssr: false,
  }
);

const TelegramSettings = dynamic(
  () => import('@app/components/TelegramSettings'),
  {
    ssr: false,
  }
);

type Props = {
  agentId: string;
};

function AgentDeployTab(props: Props) {
  const { data: session, status } = useSession();

  const router = useRouter();
  const [state, setState] = useStateReducer({
    isSlackModalOpen: false,
    isUsageModalOpen: false,
    isCrispModalOpen: false,
  });

  const bubbleWidgetModal = useModal();
  const iframeWidgetModal = useModal();
  const standalonePageModal = useModal();
  const zendeskModal = useModal();
  const whatsappModal = useModal();
  const telegramModal = useModal();
  const shopifyModal = useModal();

  const { query, mutation } = useAgent({
    id: props.agentId as string,
  });

  const agent = query?.data;

  if (!agent) {
    return null;
  }

  return (
    <>
      <SettingCard
        title="Deploy"
        description="Deploy your agent with the following widgets or integrations"
        disableSubmitButton
        cardProps={{
          sx: {
            maxWidth: '100%',
          },
        }}
      >
        <List
          variant="plain"
          sx={{
            borderRadius: 'lg',
          }}
        >
          {[
            {
              name: 'Web / Bubble - Embed in a chat bubble',
              // icon: <LanguageRoundedIcon sx={{ fontSize: 32 }} />,
              icon: (
                <IconButton
                  size="sm"
                  variant="solid"
                  sx={(theme) => ({
                    // backgroundColor: state.config.primaryColor,
                    borderRadius: '100%',
                  })}
                >
                  <AutoAwesomeIcon />
                </IconButton>
              ),
              action: () => {
                bubbleWidgetModal.open();
              },
              publicAgentRequired: true,
            },
            {
              name: 'Web / Standard - Embed in a container on your website',
              icon: <Typography sx={{ fontSize: 32 }}>📺</Typography>,
              action: () => {
                iframeWidgetModal.open();
              },
              publicAgentRequired: true,
            },
            {
              name: 'Web / Standalone - No-code web page hosted on Chaindesk',
              icon: <Typography sx={{ fontSize: 32 }}>💅</Typography>,
              action: () => {
                standalonePageModal.open();
              },
              publicAgentRequired: true,
            },
            {
              hidden: false,
              name: 'WhatsApp',
              icon: (
                <Image
                  className="w-8"
                  src="/integrations/whatsapp/icon.svg"
                  width={100}
                  height={100}
                  alt="Whatsapp Logo"
                />
              ),
              action: async () => {
                whatsappModal.open();
              },
              isPremium: true,
            },
            {
              hidden: false,
              name: 'Shopify',
              icon: (
                <Image
                  className="w-8"
                  src="/shopify/icon.svg"
                  width={100}
                  height={100}
                  alt="Shopify Logo"
                />
              ),
              action: async () => {
                shopifyModal.open();
              },
              isPremium: true,
            },
            {
              name: 'Zapier',
              isPremium: true,
              icon: (
                <img
                  className="w-8"
                  src="https://images.ctfassets.net/lzny33ho1g45/6YoKV9RS3goEx54iFv96n9/78100cf9cba971d04ac52d927489809a/logo-symbol.png"
                  alt="zapier logo"
                ></img>
              ),

              action: () => {
                window.open(
                  'https://zapier.com/apps/databerry/integrations',
                  '_blank'
                );
              },
            },
            {
              hidden: false,
              name: 'Telegram',
              icon: (
                <Image
                  className="w-8"
                  src="/integrations/telegram/icon.svg"
                  width={100}
                  height={100}
                  alt="Telegram Logo"
                />
              ),
              action: async () => {
                telegramModal.open();
              },
              isPremium: true,
            },
            {
              name: 'Slack',
              icon: (
                <Image
                  className="w-8"
                  src="/shared/images/logos/slack.png"
                  width={100}
                  height={100}
                  alt="slack logo"
                ></Image>
              ),
              isPremium: true,
              action: () => {
                setState({ isSlackModalOpen: true });
              },
            },
            {
              name: 'Crisp',
              isPremium: true,
              icon: (
                <Image
                  className="w-20"
                  src="https://upload.wikimedia.org/wikipedia/commons/0/0b/Logo_de_Crisp.svg"
                  width={20}
                  height={20}
                  alt="crisp logo"
                ></Image>
              ),
              action: () => {
                setState({ isCrispModalOpen: true });
              },
            },
            {
              name: 'WordPress',
              icon: (
                <Image
                  className="w-8"
                  src="https://upload.wikimedia.org/wikipedia/commons/0/09/Wordpress-Logo.svg"
                  width={100}
                  height={100}
                  alt="Wordpress Logo"
                />
              ),
              action: () => {
                window.open(
                  'https://wordpress.com/plugins/databerry',
                  '_blank'
                );
              },
              publicAgentRequired: true,
            },
            // {
            //   name: 'Zendesk',
            //   isPremium: false,
            //   icon: (
            //     <img
            //       className="w-8"
            //       src="/integrations/zendesk/icon.svg"
            //       alt="zendesk logo"
            //     ></img>
            //   ),

            //   action: async () => {
            //     zendeskModal.open();
            //   },
            // },
          ]
            .filter((each) =>
              router.query.showHidden === 'true' ? true : !each.hidden
            )
            .map((each, index, arr) => (
              <ListItem
                key={index}
                sx={(theme) => ({
                  borderBottomWidth: index < arr.length - 1 ? 0.1 : 0,
                  borderBottomColor: theme.palette.divider,
                  minHeight: 70,
                })}
              >
                {/* <ListItemButton> */}
                <Stack direction="row" gap={2} alignItems={'center'}>
                  {each.icon}
                  <Typography fontWeight={'bold'}>{each.name}</Typography>

                  {each.isPremium && (
                    <Chip color="warning" size="sm" variant="soft">
                      premium
                    </Chip>
                  )}
                </Stack>

                {(!each?.isPremium ||
                  (each.isPremium && session?.organization?.isPremium)) &&
                  (each?.publicAgentRequired &&
                  agent?.visibility === DatastoreVisibility.private ? (
                    <Button
                      size="sm"
                      variant="outlined"
                      startDecorator={<ToggleOffIcon />}
                      sx={{ ml: 'auto' }}
                      loading={mutation.isMutating}
                      onClick={async () => {
                        const accepted = await confirm(
                          'This feature requires your Agent to be public. Unauthenticated users (visitors) can query it. Make it public?'
                        );

                        if (!accepted) {
                          return;
                        }

                        await mutation.trigger({
                          ...agent,
                          visibility: AgentVisibility.public,
                        } as any);

                        await query.mutate();
                      }}
                    >
                      Enable
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="outlined"
                      startDecorator={<TuneRoundedIcon />}
                      sx={{ ml: 'auto' }}
                      onClick={each.action}
                    >
                      Settings
                    </Button>
                  ))}

                {each.isPremium && !session?.organization?.isPremium && (
                  <Button
                    size="sm"
                    variant="outlined"
                    color="warning"
                    sx={{ ml: 'auto' }}
                    onClick={() => setState({ isUsageModalOpen: true })}
                  >
                    Subscribe
                  </Button>
                )}
              </ListItem>
            ))}
        </List>
      </SettingCard>

      {query?.data?.id! && (
        <>
          <SlackBotModal
            agentId={query?.data?.id!}
            isOpen={state.isSlackModalOpen}
            handleCloseModal={() => setState({ isSlackModalOpen: false })}
          />

          <CrispSettingsModal
            agentId={query?.data?.id!}
            isOpen={state.isCrispModalOpen}
            handleCloseModal={() => setState({ isCrispModalOpen: false })}
          />

          <bubbleWidgetModal.component
            title="Chatbox Bubble"
            description="Settings"
            dialogProps={{
              sx: {
                maxWidth: 'lg',
              },
            }}
          >
            <BubbleWidgetSettings agentId={query?.data?.id!} />
          </bubbleWidgetModal.component>

          <iframeWidgetModal.component
            title="Chatbox Standard"
            description="Settings"
            dialogProps={{
              sx: {
                maxWidth: 'lg',
              },
            }}
          >
            <IFrameWidgetSettings agentId={query?.data?.id!} />
          </iframeWidgetModal.component>

          <standalonePageModal.component
            title="Standalone Web Page"
            description="Settings"
            dialogProps={{
              sx: {
                maxWidth: 'lg',
              },
            }}
          >
            <StandalonePageWidgetSettings agentId={query?.data?.id!} />
          </standalonePageModal.component>

          <telegramModal.component
            title={
              <Typography
                startDecorator={
                  <Image
                    className="w-6"
                    src="/integrations/telegram/icon.svg"
                    width={100}
                    height={100}
                    alt="Telegram Logo"
                  />
                }
              >
                Telegram
              </Typography>
            }
            dialogProps={{
              sx: {
                maxWidth: 'sm',
                height: 'auto',
              },
            }}
          >
            <TelegramSettings agentId={props.agentId} />
          </telegramModal.component>

          <whatsappModal.component
            title={
              <Typography
                startDecorator={
                  <Image
                    className="w-6"
                    src="/integrations/whatsapp/icon.svg"
                    width={100}
                    height={100}
                    alt="Whatsapp Logo"
                  />
                }
              >
                WhatsApp
              </Typography>
            }
            dialogProps={{
              sx: {
                maxWidth: 'sm',
                height: 'auto',
              },
            }}
          >
            <WhatsAppSettings agentId={props.agentId} />
          </whatsappModal.component>

          <shopifyModal.component
            title={
              <Typography
                startDecorator={
                  <Image
                    className="w-6"
                    src="/shopify/icon.svg"
                    width={100}
                    height={100}
                    alt="Whatsapp Logo"
                  />
                }
              >
                Shopify
              </Typography>
            }
            dialogProps={{
              sx: {
                maxWidth: 'md',
                height: 'auto',
              },
            }}
          >
            <ShopifySettings agentId={props.agentId} />
          </shopifyModal.component>
        </>
      )}

      <UsageLimitModal
        title="Upgrade to premium to use this feature"
        description="This feature is restricted to premium users only"
        isOpen={state.isUsageModalOpen}
        handleClose={() => {
          setState({
            isUsageModalOpen: false,
          });
        }}
      />
    </>
  );
}

export default AgentDeployTab;
