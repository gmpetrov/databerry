import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import { Box, Breadcrumbs, Divider, Stack, Typography } from '@mui/joy';
import Link from 'next/link';
import { ReactElement } from 'react';
import * as React from 'react';
import { z } from 'zod';

import Layout from '@app/components/Layout';

import { RouteNames } from '@chaindesk/lib/types';

const Schema = z.object({ query: z.string().min(1) });

export default function DatasourcesPage() {
  return (
    <Box
      component="main"
      className="MainContent"
      sx={(theme) => ({
        position: 'relative',
        width: '100%',
        height: '100%',
        maxHeight: '100%',
        overflow: 'hidden',
        px: {
          xs: 2,
          md: 6,
        },
        pt: {},
        pb: {
          xs: 2,
          sm: 2,
          md: 3,
        },
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
        gap: 1,
      })}
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
        <Link href={RouteNames.APPS}>
          <Typography fontSize="inherit" color="neutral">
            Apps
          </Typography>
        </Link>
        <Typography fontSize="inherit" color="neutral">
          Crisp Plugin
        </Typography>
        {/* <JoyLink
          underline="hover"
          color="neutral"
          fontSize="inherit"
          href="#some-link"
        >
          Datastores
        </JoyLink> */}
        {/* <Typography fontSize="inherit" variant="soft" color="primary">
          Orders
        </Typography> */}
      </Breadcrumbs>

      <Divider sx={{ mt: 2 }} />

      <Box
        sx={(theme) => ({
          maxWidth: '100%',
          width: theme.breakpoints.values.md,
          mx: 'auto',
          mt: 4,
        })}
      >
        <Stack gap={4}>
          <Typography level="body-md">
            1. Get the API Key of one of your Datastore{' '}
          </Typography>
          <Typography level="body-md">
            {`2. Go to Crisp's marketplace and install Chaindesk plugin`}
          </Typography>
          <Typography level="body-md">
            3. Get the API Key of one of your Datastore{' '}
          </Typography>
        </Stack>
      </Box>
    </Box>
  );
}

DatasourcesPage.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};
