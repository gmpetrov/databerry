import { Divider, FormControl, FormLabel } from '@mui/joy';
import { useSession } from 'next-auth/react';
import React from 'react';
import { useFormContext } from 'react-hook-form';

import { SketchPicker } from '@chaindesk/ui/ColorPicker';
import Input from '@chaindesk/ui/Input';

import InitMessageInput from './InitMessageInput';
import InterfaceConfigCheckbox from './InterfaceConfigCheckbox';
import SuggestionsInput from './SuggestionsInput';

type Props = {};

export default function CommonInterfaceInput(props: Props) {
  const { watch, control, register, setValue } = useFormContext();
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
      {/* <InterfaceConfigCheckbox
        field="isHumanRequestedDisabled"
        label="Disable the ability to request a human operator"
      /> */}
      {/* <InterfaceConfigCheckbox
        field="isLeadCaptureDisabled"
        label="Disable the ability to capture a visitor's emails"
      /> */}
      {/* <InterfaceConfigCheckbox
        field="isMarkAsResolvedDisabled"
        label="Disable the ability to mark a conversation as resolved"
      /> */}
      <InterfaceConfigCheckbox
        field="isBrandingDisabled"
        label="Remove Chaindesk Branding (Pro plan required)"
        disabled={
          !session?.organization?.isPremium ||
          session?.organization?.subscriptions?.[0]?.plan === 'level_1'
        }
      />
      <SuggestionsInput />

      <FormControl>
        <FormLabel>Brand Color</FormLabel>
        <SketchPicker
          disableAlpha
          color={config?.primaryColor || '42'}
          onChange={(color) =>
            setValue('interfaceConfig.primaryColor', color.hex, {
              shouldDirty: true,
              shouldValidate: true,
            })
          }
        />
      </FormControl>

      {/* <Input
        control={control}
        defaultValue={config?.primaryColor || '#000000'}
        placeholder="#000000"
        label="Brand Color"
        {...register('interfaceConfig.primaryColor')}
      /> */}

      <Divider />
    </>
  );
}
