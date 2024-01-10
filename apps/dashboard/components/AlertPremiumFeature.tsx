import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import WarningIcon from '@mui/icons-material/Warning';
import Alert from '@mui/joy/Alert';
import Button from '@mui/joy/Button';
import Stack from '@mui/joy/Stack';
import Typography from '@mui/joy/Typography';
import Link from 'next/link';
import React from 'react';

import { RouteNames } from '@chaindesk/lib/types';

type Props = {
  title?: string;
  description?: string;
  inline?: boolean;
};

const AlertPremiumFeature = ({ title, description }: Props) => {
  const controls = (
    <Stack
      direction="row"
      sx={{ ml: 'auto', width: '100%', justifyContent: 'end' }}
      gap={1}
    >
      <Link href={RouteNames.BILLING}>
        <Button
          endDecorator={<ArrowForwardRoundedIcon />}
          color="success"
          variant="solid"
        >
          Upgrade Plan
        </Button>
      </Link>
    </Stack>
  );

  return (
    <Alert
      color="warning"
      variant="soft"
      sx={{ alignItems: 'flex-start' }}
      startDecorator={
        <WarningIcon sx={{ mt: '2px', mx: '4px' }} fontSize="xl2" />
      }
    >
      <Stack
        direction="row"
        sx={{ width: '100%', flex: 1, alignItems: 'center' }}
      >
        <Stack sx={{ width: '100%' }}>
          <Typography fontWeight="lg" mt={0.25}>
            {title || 'Usage limit reached'}
          </Typography>
          {/* <Typography fontSize="sm" sx={{ opacity: 0.8 }}>
            {`${description || 'Upgrade your plan to get higher usage'}`}
          </Typography> */}
        </Stack>
        {controls}
      </Stack>
    </Alert>
  );
};

export default AlertPremiumFeature;
