import {
  Checkbox,
  FormControl,
  FormHelperText,
  FormLabel,
  Stack,
} from '@mui/joy';
import React, { useMemo } from 'react';
import { useFormContext } from 'react-hook-form';

import {
  CreateAgentSchema,
  LeadCaptureToolSchema,
} from '@chaindesk/lib/types/dtos';

type Props = {
  name?: `tools.${number}`;
};

export default function LeadCaptureToolFormInput({ name }: Props) {
  const methods = useFormContext<LeadCaptureToolSchema | CreateAgentSchema>();
  const prefix = useMemo(() => {
    return name ? `${name}.` : '';
  }, [name]) as `tools.${number}.` | '';

  const values = methods.watch(`${prefix}config` as const);

  return (
    <Stack>
      <Stack gap={2}>
        <FormControl>
          <FormLabel>📧 Email</FormLabel>

          <Checkbox
            checked={Boolean(values?.isEmailEnabled)}
            label="Enable User Email Capture"
            {...methods.register(`${prefix}config.isEmailEnabled`)}
            // disabled={!session?.organization?.isPremium}
          />
          <FormHelperText>
            Your agent will be able to capture the user email
          </FormHelperText>
        </FormControl>
        <FormControl>
          <FormLabel>📞 Phone Number</FormLabel>

          <Checkbox
            checked={Boolean(values?.isPhoneNumberEnabled)}
            label="Enable User Phone Number Capture"
            {...methods.register(`${prefix}config.isPhoneNumberEnabled`)}
            // disabled={!session?.organization?.isPremium}
          />
          <FormHelperText>
            Your agent will be able to capture the user phone number
          </FormHelperText>
        </FormControl>

        <FormControl>
          <FormLabel>⛔️ Required to continue conversation</FormLabel>

          <Checkbox
            // checked={Boolean(values.isRequired)}
            checked={Boolean(values?.isRequired)}
            label="Make user details mandatory"
            {...methods.register(`${prefix}config.isRequired`)}
            // disabled={!session?.organization?.isPremium}
          />
          <FormHelperText>
            Your Agent will ask the user to provide his information before
            continuing the conversation
          </FormHelperText>
        </FormControl>
      </Stack>
    </Stack>
  );
}
