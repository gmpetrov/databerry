import { Button, CardOverflow, Typography } from '@mui/joy';
import { Box, Card, CardActions, Divider, Stack } from '@mui/joy';
import { SxProps } from '@mui/joy/styles/types';
import React from 'react';

type Props = {
  sxProps?: SxProps;
  children: React.ReactNode;
  title?: string;
  description?: string;
  submitButtonDisabled?: boolean;
  onSubmit?: any;
  submitButtonText?: string;
  submitButtonLoading?: boolean;
};

function SettingCard(props: Props) {
  return (
    <Card
      sx={{
        ...props?.sxProps,
      }}
    >
      <Box sx={{ mb: 1 }}>
        {props.title && <Typography level="title-md">{props.title}</Typography>}
        {props.description && (
          <Typography level="body-sm">{props.description}</Typography>
        )}
      </Box>

      <Divider />
      <Stack spacing={2} sx={{ my: 1 }}>
        {props.children}
      </Stack>
      {props.onSubmit && (
        <CardOverflow sx={{ borderTop: '1px solid', borderColor: 'divider' }}>
          <CardActions sx={{ alignSelf: 'flex-end', pt: 2 }}>
            {/* <Button size="sm" variant="outlined" color="neutral">
            Cancel
          </Button> */}
            <Button
              loading={props.submitButtonLoading}
              disabled={props.submitButtonDisabled}
              size="sm"
              variant="solid"
              onClick={props.onSubmit}
            >
              {props.submitButtonText || 'Submit'}
            </Button>
          </CardActions>
        </CardOverflow>
      )}
    </Card>
  );
}

export default SettingCard;
