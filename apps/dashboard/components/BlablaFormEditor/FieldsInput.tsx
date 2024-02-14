import AddCircleRoundedIcon from '@mui/icons-material/AddCircleRounded';
import CloseIcon from '@mui/icons-material/Close';
import {
  Box,
  Button,
  FormLabel,
  IconButton,
  Option,
  Select,
  Stack,
} from '@mui/joy';
import cuid from 'cuid';
import debounce from 'p-debounce';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrayPath,
  Controller,
  FormProvider,
  useFieldArray,
  useForm,
  useFormContext,
} from 'react-hook-form';

import Input from '@app/components/Input';

import { CreateFormSchema } from '@chaindesk/lib/types/dtos';

import { forceSubmit } from './utils';

type Props = {};

export const Choices = <T extends Record<string, unknown>>({
  name,
  actionLabel,
  label,
  init = true,
}: {
  name: ArrayPath<T>;
  actionLabel: string;
  label?: string;
  init?: boolean;
}) => {
  const { control, handleSubmit, register, trigger } = useFormContext<T>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: name,
  });

  useEffect(() => {
    if (fields.length === 0 && init) {
      append('' as ArrayPath<T>);
    }
  }, [append, fields.length]);

  return (
    <Stack gap={1} direction="row">
      <Stack gap={1} width={'100%'}>
        <FormLabel>{label}</FormLabel>
        {fields?.map((field, i) => (
          <Stack key={field.id} width={'100%'} direction="row" gap={1}>
            <Input
              size="sm"
              control={control}
              variant="soft"
              endDecorator={
                <IconButton
                  onClick={() => {
                    remove(i);
                    forceSubmit();
                  }}
                >
                  <CloseIcon fontSize="sm" />
                </IconButton>
              }
              {...register(`${name}.${i}`)}
            />
          </Stack>
        ))}
      </Stack>
      <div className="flex flex-col justify-end  h-full">
        <Button
          size="sm"
          onClick={() => append('' as ArrayPath<T>)}
          variant="plain"
          sx={{
            ml: 'auto',
            minWidth: '200px',
          }}
          startDecorator={<AddCircleRoundedIcon fontSize="sm" />}
        >
          {actionLabel}
        </Button>
      </div>
    </Stack>
  );
};

function FieldsInput({}: Props) {
  const methods = useFormContext<CreateFormSchema>();

  const { fields, append, remove } = useFieldArray({
    control: methods.control,
    name: 'draftConfig.fields',
  });

  const fieldsValues = methods.watch('draftConfig.fields');

  return (
    <Stack gap={2}>
      {fields?.map((field, index) => (
        <Box key={field.id} display="flex" alignItems="center">
          <Stack direction={'column'} gap={1} sx={{ width: '100%' }}>
            <Stack
              sx={{ width: '100%' }}
              direction="row"
              gap={1}
              alignItems={'start'}
            >
              <Controller
                name={`draftConfig.fields.${index}.type` as const}
                render={({
                  field: { onChange, onBlur, value, name, ref },
                  fieldState: { invalid, isTouched, isDirty, error },
                  formState,
                }) => (
                  <Select
                    size="sm"
                    value={value}
                    onChange={(_, value) => {
                      onChange(value);
                      forceSubmit();
                    }}
                    sx={{ minWidth: '80px' }}
                  >
                    <Option value="text">text</Option>
                    <Option value="multiple_choice">mutliple choice</Option>
                  </Select>
                )}
              ></Controller>
              <Input
                control={methods.control}
                sx={{ width: '100%' }}
                size="sm"
                key={field.id}
                defaultValue={field.name}
                placeholder="e.g. email"
                {...methods.register(
                  `draftConfig.fields.${index}.name` as const
                )}
                endDecorator={
                  <IconButton
                    onClick={() => {
                      remove(index);
                      forceSubmit();
                    }}
                  >
                    <CloseIcon fontSize="sm" />
                  </IconButton>
                }
              />
            </Stack>

            {fieldsValues?.[index]?.type === 'multiple_choice' && (
              <Stack sx={{ ml: 'auto' }}>
                <Choices<CreateFormSchema>
                  actionLabel="Add Choice"
                  name={`draftConfig.fields.${index}.choices` as any}
                />
              </Stack>
            )}
          </Stack>
        </Box>
      ))}
      <Button
        size="sm"
        startDecorator={<AddCircleRoundedIcon fontSize="sm" />}
        variant="outlined"
        color="primary"
        onClick={() => {
          append({
            name: '',
            id: cuid(),
            required: true,
            type: 'text',
          });
          methods.trigger();
        }}
      >
        Add Field
      </Button>
    </Stack>
  );
}

export default FieldsInput;
