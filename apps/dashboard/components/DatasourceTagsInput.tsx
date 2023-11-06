import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import Button from '@mui/joy/Button';
import FormControl from '@mui/joy/FormControl';
import FormHelperText from '@mui/joy/FormHelperText';
import FormLabel from '@mui/joy/FormLabel';
import IconButton from '@mui/joy/IconButton';
import Stack from '@mui/joy/Stack';
import React, { useEffect } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';

import { DatasourceSchema } from '@chaindesk/lib/types/models';

import Input from './Input';

type Props = {};

function DatasourceTagsInput({}: Props) {
  const { control, register } = useFormContext<DatasourceSchema>();

  const { fields, append, prepend, remove, swap, move, insert } = useFieldArray(
    {
      name: 'config.tags',
    }
  );

  useEffect(() => {
    if (fields.length === 0) {
      append('');
    }
  }, [fields]);

  return (
    <FormControl>
      <FormLabel>Tags</FormLabel>
      <FormHelperText>
        Use tags to attach extra context to a Datasource
      </FormHelperText>
      <Stack spacing={2} sx={{ mt: 1, display: 'flex' }}>
        <Stack spacing={1}>
          {fields.map((field, index) => (
            <Input
              key={field.id} // important to include key with field's id
              control={control as any}
              placeholder={`Tag (e.g. "Country: France" or "Customer Support")`}
              {...register(`config.tags.${index}`)}
              endDecorator={
                <IconButton
                  variant="plain"
                  color="danger"
                  size="sm"
                  onClick={() => remove(index)}
                >
                  <CloseRoundedIcon />
                </IconButton>
              }
            />
          ))}
        </Stack>
      </Stack>
      <Button
        variant="outlined"
        onClick={() => append('')}
        sx={{ mt: 2, ml: 'auto' }}
      >
        Add Tag
      </Button>
    </FormControl>
  );
}

export default DatasourceTagsInput;
