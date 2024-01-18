import { Divider } from '@mui/joy';
import { useSession } from 'next-auth/react';
import React from 'react';
import { useFormContext } from 'react-hook-form';

import Input from '@app/components/Input';

import InitMessageInput from './InitMessageInput';
import InterfaceConfigCheckbox from './InterfaceConfigCheckbox';
import SuggestionsInput from './SuggestionsInput';

type Props = {};

export default function CommonInterfaceInput(props: Props) {
  const { watch, control, register } = useFormContext();
  const { data: session } = useSession();

  const config = watch('interfaceConfig');
  return (
    <>
      <Input
        label="Window Title"
        control={control}
        placeholder="Agent Smith"
        {...register('interfaceConfig.displayName')}
      />
      <InitMessageInput />
      <InterfaceConfigCheckbox
        field="isInitMessagePopupDisabled"
        label="Disable initial message popup"
      />
      <InterfaceConfigCheckbox
        field="isHumanRequestedDisabled"
        label="Disable the ability to request a human operator"
      />
      <InterfaceConfigCheckbox
        field="isLeadCaptureDisabled"
        label="Disable the ability to capture a visitor's emails"
      />
      <InterfaceConfigCheckbox
        field="isMarkAsResolvedDisabled"
        label="Disable the ability to mark a conversation as resolved"
      />
      <InterfaceConfigCheckbox
        field="isBrandingDisabled"
        label="Remove Chaindesk Branding (premium account required)"
        disabled={!session?.organization?.isPremium}
      />
      <SuggestionsInput />
      <Input
        control={control}
        defaultValue={config?.primaryColor || '#000000'}
        placeholder="#000000"
        label="Brand Color"
        {...register('interfaceConfig.primaryColor')}
      />
      <Divider />
    </>
  );
}
