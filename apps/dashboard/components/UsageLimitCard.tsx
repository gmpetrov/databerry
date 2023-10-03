import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import WarningIcon from '@mui/icons-material/Warning';
import Alert from '@mui/joy/Alert';
import Button from '@mui/joy/Button';
import Card from '@mui/joy/Card';
import Divider from '@mui/joy/Divider';
import Modal from '@mui/joy/Modal';
import Stack from '@mui/joy/Stack';
import Typography from '@mui/joy/Typography';
import Link from 'next/link';
import React from 'react';

import { RouteNames } from '@chaindesk/lib/types';

type Props = {
  title?: string;
  description?: string;
  handleClose?: any;
};

const UsageLimitCard = ({ title, description, handleClose }: Props) => {
  return (
    <Card
      variant="outlined"
      color="warning"
      sx={{ width: 500, maxWidth: '100%' }}
    >
      <Alert
        color="warning"
        variant="soft"
        sx={{ alignItems: 'flex-start' }}
        startDecorator={
          <WarningIcon sx={{ mt: '2px', mx: '4px' }} fontSize="xl2" />
        }
      >
        <div>
          <Typography fontWeight="lg" mt={0.25}>
            {title || 'Usage limit reached'}
          </Typography>
          <Typography fontSize="sm" sx={{ opacity: 0.8 }}>
            {`${description || 'Upgrade your plan to get higher usage'}`}
          </Typography>
        </div>
      </Alert>

      <Divider sx={{ my: 3 }} />

      <Stack direction="row" sx={{ ml: 'auto' }} gap={1}>
        {handleClose && (
          <Button onClick={handleClose} variant="plain" color="neutral">
            Cancel
          </Button>
        )}

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
    </Card>
  );
};

export default UsageLimitCard;
