import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import { Breadcrumbs } from '@mui/joy';
import Stack from '@mui/joy/Stack';
import { SxProps } from '@mui/joy/styles/types';
import Tab, { tabClasses } from '@mui/joy/Tab';
import TabList from '@mui/joy/TabList';
import Tabs from '@mui/joy/Tabs';
import Typography from '@mui/joy/Typography';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React from 'react';

import { RouteNames } from '@chaindesk/lib/types';

import Layout from './Layout';

type Props = {
  children: any;
  sxProps?: SxProps;
  mainSxProps?: SxProps;
};

function SettingsLayout(props: Props) {
  const router = useRouter();

  return (
    <Layout mainSxProps={props.mainSxProps}>
      <Stack
        sx={{
          px: {
            xs: 2,
            md: 6,
          },
          flex: 1,
          pt: {},
          height: '100%',
          ...props.sxProps,
        }}
      >
        <Breadcrumbs
          size="sm"
          aria-label="breadcrumbs"
          separator={<ChevronRightRoundedIcon />}
          sx={{
            '--Breadcrumbs-gap': '1rem',
            '--Icon-fontSize': '16px',
            fontWeight: 'lg',
            color: 'neutral.400',
            px: 0,
          }}
        >
          <Link href={RouteNames.HOME}>
            <HomeRoundedIcon />
          </Link>
          <Link href={RouteNames.SETTINGS}>
            <Typography
              fontSize="inherit"
              color="neutral"
              className="hover:underline"
            >
              Settings
            </Typography>
          </Link>
        </Breadcrumbs>
        <Stack
          sx={{
            position: 'sticky',
            top: -16,
            backgroundColor: 'background.popup',
            zIndex: 999,
          }}
        >
          <Tabs
            aria-label="tabs"
            // value={(router.query.tab as string) || 'chat'}
            value={router.pathname}
            size="md"
            sx={{
              // borderRadius: 'lg',
              // display: 'inline-flex',
              //   mt: 4,
              bgcolor: 'transparent',
              width: '100%',
            }}
            // onChange={(event, value) => {
            //   //   handleChangeTab(value as string);
            //   router.push(value as string);
            // }}
          >
            <TabList
              size="sm"
              // disableUnderline={true}
              // sx={{
              //   p: 0.5,
              //   gap: 0.5,
              //   borderRadius: 'xl',
              //   bgcolor: 'background.level1',
              //   [`& .${tabClasses.root}[aria-selected="true"]`]: {
              //     boxShadow: 'sm',
              //     bgcolor: 'background.surface',
              //   },
              // }}

              sx={{
                // pt: 2,
                // justifyContent: 'center',
                [`&& .${tabClasses.root}`]: {
                  flex: 'initial',
                  bgcolor: 'transparent',
                  '&:hover': {
                    bgcolor: 'transparent',
                  },
                  [`&.${tabClasses.selected}`]: {
                    color: 'primary.plainColor',
                    '&::after': {
                      height: '3px',
                      borderTopLeftRadius: '3px',
                      borderTopRightRadius: '3px',
                      bgcolor: 'primary.500',
                    },
                  },
                },
              }}
            >
              <Link href={'/settings/profile'}>
                <Tab indicatorInset value={'/settings/profile'}>
                  {/* <ListItemDecorator>
                      <MessageRoundedIcon />
                    </ListItemDecorator> */}
                  Profile
                </Tab>
              </Link>

              <Link href={'/settings/team'}>
                <Tab indicatorInset value={'/settings/team'}>
                  {/* <ListItemDecorator>
                      <MessageRoundedIcon />
                    </ListItemDecorator> */}
                  Team
                </Tab>
              </Link>

              <Link href={'/settings/billing'}>
                <Tab indicatorInset value={'/settings/billing'}>
                  {/* <ListItemDecorator>
                      <RocketLaunchRoundedIcon />
                    </ListItemDecorator> */}
                  Billing
                </Tab>
              </Link>

              <Link href={'/settings/api-keys'}>
                <Tab indicatorInset value={'/settings/api-keys'}>
                  {/* <ListItemDecorator>
                      <SettingsIcon />
                    </ListItemDecorator> */}
                  API Keys
                </Tab>
              </Link>
            </TabList>
          </Tabs>
        </Stack>

        <Stack
          sx={{
            flex: 1,
            pt: {
              xs: 2,
              sm: 2,
              md: 3,
            },
            heigth: '100%',
            overflowY: 'auto',
          }}
        >
          {props.children}
        </Stack>
      </Stack>
    </Layout>
  );
}

export default SettingsLayout;
