import React from 'react';
import { useFormContext } from 'react-hook-form';

import Input from '@app/components/Input';

type Props = {
  defaultValue?: string;
};

function InitMessageInput(props: Props) {
  const { control, register } = useFormContext();

  return (
    <Input
      label="Initial Message"
      control={control}
      defaultValue={props.defaultValue}
      placeholder="👋 Hi, How can I help you?"
      {...register('interfaceConfig.initialMessage')}
    />
  );
}

export default InitMessageInput;
