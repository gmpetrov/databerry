import React, { useCallback, useState } from 'react';
import ThumbUpAltRoundedIcon from '@mui/icons-material/ThumbUpAltRounded';
import ThumbDownAltRoundedIcon from '@mui/icons-material/ThumbDownAltRounded';
import { MessageEvalUnion } from '@chaindesk/lib/types';
import IconButton from '@mui/joy/IconButton';

export default function EvalButton(props: {
  messageId: string;
  eval?: MessageEvalUnion | null;
  handleEvalAnswer?: (props: {
    messageId: string;
    value: MessageEvalUnion;
  }) => any;
}) {
  const [value, setValue] = useState(props.eval);

  const handleClick = useCallback(
    async (value: MessageEvalUnion) => {
      setValue(value);

      await props.handleEvalAnswer?.({
        messageId: props.messageId,
        value,
      });
    },
    [props.handleEvalAnswer]
  );

  return (
    <React.Fragment>
      {(!value || value === 'good') && (
        <IconButton
          size="sm"
          color={value ? 'success' : 'neutral'}
          variant="plain"
          onClick={async (e) => {
            e.stopPropagation();
            await handleClick('good');
          }}
        >
          <ThumbUpAltRoundedIcon sx={{ fontSize: 'sm' }} />
        </IconButton>
      )}
      {(!value || value === 'bad') && (
        <IconButton
          size="sm"
          color={value ? 'danger' : 'neutral'}
          variant="plain"
          onClick={async (e) => {
            e.stopPropagation();
            await handleClick('bad');
          }}
        >
          <ThumbDownAltRoundedIcon sx={{ fontSize: 'sm' }} />
        </IconButton>
      )}
    </React.Fragment>
  );
}
