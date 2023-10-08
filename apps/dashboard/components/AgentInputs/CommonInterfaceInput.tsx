import React from 'react';
import { useFormContext } from 'react-hook-form';

import Input from '@app/components/Input';

import InitialBubbleMessageCheckbox from './InitialBubbleMessageCheckbox';
import InitMessageInput from './InitMessageInput';
import SuggestionsInput from './SuggestionsInput';

type Props = {};

export default function CommonInterfaceInput(props: Props) {
  const { watch, control, register } = useFormContext();

  const config = watch('interfaceConfig');

  return (
    <>
      <InitMessageInput />
      <InitialBubbleMessageCheckbox />
      <SuggestionsInput />
      <Input
        control={control}
        defaultValue={config?.primaryColor || '#000000'}
        placeholder="#000000"
        label="Brand Color"
        {...register('interfaceConfig.primaryColor')}
      />

      <Input
        label="Display Name"
        control={control}
        placeholder="Agent Smith"
        {...register('interfaceConfig.displayName')}
      />
    </>
  );
}
