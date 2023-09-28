import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import Textarea from '@mui/joy/Textarea';
import React from 'react';
import { useFormContext } from 'react-hook-form';

type Props = {};

export default function SuggestionsInput(props: Props) {
  const { watch, setValue } = useFormContext();

  const messageTemplates = watch(
    'interfaceConfig.messageTemplates'
  ) as string[];

  return (
    <FormControl>
      <FormLabel>Message Suggestions</FormLabel>

      <Textarea
        placeholder={`Pricing Plans\nHow to create a website?`}
        minRows={3}
        defaultValue={messageTemplates?.join('\n')}
        onChange={(e) => {
          e.stopPropagation();

          try {
            const str = e.target.value;

            const values = str.split('\n');
            const domains = values
              .map((each) => each.trim())
              .filter((each) => !!each);

            setValue('interfaceConfig.messageTemplates', domains, {
              shouldDirty: true,
              shouldValidate: true,
            });
          } catch (err) {
            console.log('err', err);
          }
        }}
      />
    </FormControl>
  );
}
