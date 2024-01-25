import Button, { ButtonProps } from '@mui/joy/Button';
import React from 'react';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';

type Props = {
  children: ButtonProps['children'];
  buttonProps: ButtonProps;
  linkProps: React.AnchorHTMLAttributes<HTMLAnchorElement>;
};

function LinkButton({ children, buttonProps, linkProps }: Props) {
  return (
    <a {...linkProps}>
      <Button
        {...buttonProps}
        endDecorator={
          linkProps?.target === '_blank' ? (
            <OpenInNewRoundedIcon
              sx={{
                fontSize: 'sm',
              }}
            />
          ) : null
        }
      >
        {children}
      </Button>
    </a>
  );
}

export default LinkButton;
