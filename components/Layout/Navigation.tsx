import AutoFixHighRoundedIcon from '@mui/icons-material/AutoFixHighRounded';
import ChatBubbleIcon from '@mui/icons-material/ChatBubbleOutlineRounded';
import QuestionMarkRoundedIcon from '@mui/icons-material/QuestionMarkRounded';
// Icons import
import StorageRoundedIcon from '@mui/icons-material/StorageRounded';
import { Card, Divider, Stack, Typography } from '@mui/joy';
import Box from '@mui/joy/Box';
import List from '@mui/joy/List';
import ListItem from '@mui/joy/ListItem';
import ListItemButton from '@mui/joy/ListItemButton';
import ListItemContent from '@mui/joy/ListItemContent';
import ListItemDecorator from '@mui/joy/ListItemDecorator';
import { Prisma } from '@prisma/client';
import Link from 'next/link';
import { useRouter } from 'next/router';
import * as React from 'react';
import useSWR from 'swr';

import { getStatus } from '@app/pages/api/status';
import { AppStatus, RouteNames } from '@app/types';
import { fetcher } from '@app/utils/swr-fetcher';

export default function Navigation() {
  const router = useRouter();

  const getDatastoresQuery = useSWR<Prisma.PromiseReturnType<typeof getStatus>>(
    '/api/status',
    fetcher,
    {
      refreshInterval: 60000,
    }
  );

  const isStatusOK = getDatastoresQuery?.data?.status === AppStatus.OK;

  const items = React.useMemo(() => {
    return [
      {
        label: 'Datastores',
        route: RouteNames.DATASTORES,
        icon: <StorageRoundedIcon fontSize="small" />,
        active: router.route === RouteNames.DATASTORES,
      },
      {
        label: 'Chat',
        route: RouteNames.CHAT,
        icon: <ChatBubbleIcon fontSize="small" />,
        active: router.route === RouteNames.CHAT,
      },
      {
        label: 'Apps',
        route: RouteNames.APPS,
        icon: <AutoFixHighRoundedIcon fontSize="small" />,
        active: router.route === RouteNames.APPS,
      },
      {
        label: 'Documentation',
        route: 'https://docs.databerry.ai/',
        icon: <QuestionMarkRoundedIcon fontSize="small" />,
      },
    ];
  }, [router.route]);

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
              <Link key={each.route} href={each.route}>
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

      <Card
        sx={{
          mt: 'auto',
          mx: 'auto',
          py: 1,
          px: 2,
        }}
        variant="soft"
        color={`${isStatusOK ? 'success' : 'danger'}`}
      >
        <Stack
          direction={'row'}
          gap={1}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Box
            sx={{
              width: '10px',
              height: '10px',
              borderRadius: '99px',
              bgcolor: isStatusOK ? 'success.300' : 'danger.500',
            }}
          />

          <Typography>status: {isStatusOK ? 'ok' : 'ko'}</Typography>
        </Stack>
      </Card>
      <Divider sx={{ my: 2 }}></Divider>
      <Link href="mailto:support@databerry.ai" className="mx-auto">
        <Typography level="body2" mx={'auto'}>
          support@databerry.ai
        </Typography>
      </Link>
    </Stack>
  );
}
