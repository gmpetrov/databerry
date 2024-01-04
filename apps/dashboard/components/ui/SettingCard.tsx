import { Button, CardOverflow, Typography } from '@mui/joy';
import { Box, Card, CardActions, Divider, Stack } from '@mui/joy';
import React, { ComponentProps, forwardRef } from 'react';

type Props = {
  children: React.ReactNode;
  title?: string;
  description?: string;
  disableSubmitButton?: boolean;

  cardProps?: ComponentProps<typeof Card>;
  stackProps?: ComponentProps<typeof Stack>;
  submitButtonProps?: ComponentProps<typeof Button>;
};

export default forwardRef(function SettingCard(props: Props, ref) {
  return (
    <Card {...props.cardProps} ref={ref as any}>
      {(props.title || props.description) && (
        <CardOverflow
          sx={{ borderBottom: '1px solid', borderColor: 'divider', p: 2 }}
        >
          <Box sx={{ mb: 1 }}>
            {props.title && (
              <Typography level="title-md">{props.title}</Typography>
            )}
            {props.description && (
              <Typography level="body-sm">{props.description}</Typography>
            )}
          </Box>
        </CardOverflow>
      )}
      <Stack
        spacing={2}
        {...props.stackProps}
        sx={{ my: 1, height: '100%', width: '100%', ...props?.stackProps?.sx }}
      >
        {props.children}
      </Stack>
      {!props.disableSubmitButton && (
        <CardOverflow sx={{ borderTop: '1px solid', borderColor: 'divider' }}>
          <CardActions sx={{ alignSelf: 'flex-end', pt: 2 }}>
            {/* <Button size="sm" variant="outlined" color="neutral">
            Cancel
          </Button> */}
            <Button
              type="submit"
              size="sm"
              variant="solid"
              {...props.submitButtonProps}
            >
              {props?.submitButtonProps?.children || 'Submit'}
            </Button>
          </CardActions>
        </CardOverflow>
      )}
    </Card>
  );
});
