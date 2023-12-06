import Card, { CardProps } from '@mui/joy/Card';
import clsx from 'clsx';
import React from 'react';

type Props = CardProps & {};

function ChatMessage({ sx, children, className, ...otherProps }: Props) {
  return (
    <Card
      size="sm"
      variant={'outlined'}
      className={clsx([className])}
      sx={(theme) => ({
        overflowY: 'hidden',
        overflowX: 'auto',
        marginRight: 'auto',
        gap: 0,
        maxWidth: '100%',
        // '.prose > *:first-child': {
        //   pt: 1,
        //   mt: 0,
        // },
        // '.prose > *:last-child': {
        //   pb: 1,
        //   mb: 0,
        // },
        py: 1,
        px: 2,
        [' p ']: {
          m: 0,
          // p: 0,
          maxWidth: '100%',
          // wordBreak: 'break-word',
        },
        [' img ']: {
          width: '100%',
          maxWidth: '300px',
          borderRadius: 'md',
          my: 1,
        },

        'h1,h2,h3,h4,h5': {
          fontSize: theme.fontSize.sm,
        },
        table: {
          overflowX: 'auto',
        },
        ...(sx as any),
      })}
      {...otherProps}
    >
      {children}
    </Card>
  );
}

export default ChatMessage;
