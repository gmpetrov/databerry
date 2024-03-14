import AddCircleIcon from '@mui/icons-material/AddCircle';
import CloseIcon from '@mui/icons-material/Close';
import Button from '@mui/joy/Button';
import FormControl from '@mui/joy/FormControl';
import FormHelperText from '@mui/joy/FormHelperText';
import FormLabel from '@mui/joy/FormLabel';
import IconButton from '@mui/joy/IconButton';
import JoyLink from '@mui/joy/Link';
import Stack from '@mui/joy/Stack';
import Textarea from '@mui/joy/Textarea';
import React, { useEffect } from 'react';
import { Controller, useFieldArray, useFormContext } from 'react-hook-form';

import Input from '@app/components/Input';

import { CreateAgentSchema } from '@chaindesk/lib/types/dtos';
type Props = {
  defaultValue?: string;
};

function InitMessageInput(props: Props) {
  const { control, register, watch } = useFormContext<CreateAgentSchema>();

  const { fields, append, remove } = useFieldArray({
    name: 'interfaceConfig.initialMessages',
  });

  // const val = watch('interfaceConfig.initialMessages') || [];

  // useEffect(() => {
  //   if (val.length <= 0) {
  //     append('');
  //   }
  // }, [val.length]);

  return (
    <Stack>
      <FormControl>
        <FormLabel>Initial Message</FormLabel>
      </FormControl>

      <FormHelperText>
        This input accepts{' '}
        <JoyLink
          href="https://www.markdownguide.org/basic-syntax/"
          target="_blank"
        >
          Markdown format
        </JoyLink>
      </FormHelperText>
      <Stack gap={1}>
        {fields.map((field, index) => (
          <Stack
            key={field.id || index}
            direction="row"
            gap={1}
            alignItems={'start'}
          >
            <Controller
              name={`interfaceConfig.initialMessages.${index}`}
              render={({
                field: { onChange, onBlur, value, name, ref },
                fieldState: { invalid, isDirty, error },
                formState,
              }) => (
                <Textarea
                  onChange={onChange}
                  onBlur={onBlur}
                  value={value}
                  // {...register(`interfaceConfig.initialMessages.${index}`)}
                  // control={control as any}
                  minRows={1}
                  maxRows={8}
                  defaultValue={props.defaultValue}
                  placeholder="👋 Hi, How can I help you?"
                  sx={{ width: '100%' }}
                />
              )}
            />

            {fields.length > 1 && (
              <IconButton
                size="sm"
                color="neutral"
                variant="outlined"
                onClick={() => remove(index)}
              >
                <CloseIcon />
              </IconButton>
            )}
          </Stack>
        ))}

        <Button
          size="sm"
          onClick={() => append('')}
          sx={{ mx: 'auto' }}
          startDecorator={<AddCircleIcon />}
          color="primary"
          variant="plain"
        >
          Add
        </Button>
      </Stack>
    </Stack>
  );
}

export default InitMessageInput;
