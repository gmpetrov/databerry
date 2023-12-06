import FormControl from '@mui/joy/FormControl';
import FormHelperText from '@mui/joy/FormHelperText';
import FormLabel from '@mui/joy/FormLabel';
import JoyLink from '@mui/joy/Link';
import Textarea from '@mui/joy/Textarea';
import React from 'react';
import { useFormContext } from 'react-hook-form';

import Input from '@app/components/Input';
type Props = {
  defaultValue?: string;
};

function InitMessageInput(props: Props) {
  const { control, register } = useFormContext();

  return (
    <FormControl>
      <FormLabel>Initial Message</FormLabel>
      <Textarea
        // control={control}
        minRows={2}
        maxRows={8}
        defaultValue={props.defaultValue}
        placeholder="👋 Hi, How can I help you?"
        {...register('interfaceConfig.initialMessage')}
      />
      <FormHelperText>
        This input accepts{' '}
        <JoyLink
          href="https://www.markdownguide.org/basic-syntax/"
          target="_blank"
        >
          Markdown format
        </JoyLink>
      </FormHelperText>
    </FormControl>
  );
}

export default InitMessageInput;
