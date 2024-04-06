import AutorenewIcon from '@mui/icons-material/Autorenew';
import DeleteIcon from '@mui/icons-material/Delete';
import { Avatar, AvatarGroup, Button, Stack, Typography } from '@mui/joy';
import React, { useRef } from 'react';

import useStateReducer from '@chaindesk/ui/hooks/useStateReducer';

type Props = {
  value?: string;
  defaultIconUrl?: string;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  onDelete?: React.MouseEventHandler<HTMLAnchorElement>;
  innerIcon?: JSX.Element;
  label?: string;
  disabled?: boolean;
  loading?: boolean;
};

function IconInput(props: Props) {
  const ref = useRef();

  return (
    <Stack gap={1}>
      <Typography level="body-sm">{props.label || 'Icon'}</Typography>
      <input
        type="file"
        hidden
        accept={'image/*'}
        onChange={props.onChange}
        ref={ref as any}
      />

      <Stack gap={1}>
        <AvatarGroup>
          <Avatar size="lg" variant="outlined" src={props.value}>
            {props.innerIcon}
          </Avatar>
        </AvatarGroup>
        <Stack direction="row" gap={1}>
          <Button
            variant="outlined"
            color="neutral"
            size="sm"
            onClick={() => {
              (ref as any).current?.click?.();
            }}
            startDecorator={<AutorenewIcon />}
            loading={props.loading}
            disabled={props.disabled}
          >
            Replace
          </Button>
          {props.value && props?.value !== props.defaultIconUrl && (
            <Button
              variant="outlined"
              color="danger"
              onClick={props.onDelete}
              size="sm"
              startDecorator={<DeleteIcon />}
              disabled={props.disabled}
              loading={props.loading}
            >
              Delete
            </Button>
          )}
        </Stack>
      </Stack>
    </Stack>
  );
}

export default IconInput;
