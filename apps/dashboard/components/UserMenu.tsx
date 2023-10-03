import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import Avatar from '@mui/joy/Avatar';
import Divider from '@mui/joy/Divider';
import Dropdown from '@mui/joy/Dropdown';
import Menu from '@mui/joy/Menu';
import MenuButton from '@mui/joy/MenuButton';
import MenuItem from '@mui/joy/MenuItem';
import Stack from '@mui/joy/Stack';
import Typography from '@mui/joy/Typography';
import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react';
import React from 'react';

import { RouteNames } from '@chaindesk/lib/types';

type Props = {};

function UserMenu({}: Props) {
  const { data: session } = useSession();

  return (
    <Stack
      direction="row"
      justifyContent={'space-between'}
      alignItems={'start'}
      gap={1}
    >
      <Dropdown>
        <MenuButton
          variant="plain"
          size={'sm'}
          // color="neutral"
          sx={{
            flexDirection: 'row',
            display: 'flex',
            gap: 1,
            width: '100%',
            maxWidth: '100%',
            // justifyContent: 'space-between',
            // borderRadius: 99,
          }}
          className="truncate"
          endDecorator={<ExpandMoreRoundedIcon />}
        >
          <Avatar
            size="sm"
            src={session?.user?.image!}
            sx={{
              ':hover': {
                cursor: 'pointer',
              },
            }}
          />

          <Typography
            className="truncate"
            sx={{ maxWidth: '100%', mr: 'auto' }}
            level="body-sm"
          >
            {session?.user?.name || session?.user?.email}
          </Typography>
        </MenuButton>
        <Menu
          sx={
            {
              // '--ListDivider-gap': '0px',
            }
          }
        >
          <Link href={RouteNames.PROFILE}>
            <MenuItem>{session?.user?.email}</MenuItem>
          </Link>
          <Divider />
          <MenuItem onClick={() => signOut()}>Logout</MenuItem>
        </Menu>
      </Dropdown>
      {/* <ColorSchemeToggle /> */}
    </Stack>
  );
}

export default UserMenu;
