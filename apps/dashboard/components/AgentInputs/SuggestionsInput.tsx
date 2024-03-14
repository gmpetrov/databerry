import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import Textarea from '@mui/joy/Textarea';
import React, { useCallback } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

type Props = {};

export default function SuggestionsInput(props: Props) {
  const { watch, setValue, control } = useFormContext();

  const messageTemplates = watch(
    'interfaceConfig.messageTemplates'
  ) as string[];

  const handleChange = useCallback<
    React.ChangeEventHandler<HTMLTextAreaElement>
  >(
    (e) => {
      e.stopPropagation();

      try {
        const str = e.target.value;

        const values = str.split('\n');
        const suggestions = values
          .map((each) => each.trim())
          .filter((each) => !!each);

        setValue('interfaceConfig.messageTemplates', suggestions, {
          shouldDirty: true,
          shouldValidate: true,
        });
      } catch (err) {
        console.log('err', err);
      }
    },
    [setValue]
  );

  return (
    <FormControl>
      <FormLabel>Message Suggestions</FormLabel>

      <Controller
        control={control}
        name={`interfaceConfig.messageTemplates`}
        render={({
          field: { onChange, onBlur, value, name, ref },
          fieldState: { invalid, isDirty, error },
          formState,
        }) => (
          <Textarea
            placeholder={`Pricing Plans\nHow to create a website?`}
            minRows={3}
            defaultValue={messageTemplates?.join('\n')}
            onChange={handleChange}
          />
        )}
      />
    </FormControl>
  );
}
