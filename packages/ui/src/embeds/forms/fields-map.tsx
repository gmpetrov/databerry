import { Stack, Typography, Textarea, Select, Option } from '@mui/joy';
import { FieldType, fieldUnion } from './types';
import { z } from 'zod';

import Input from '@chaindesk/ui/Input';
import PhoneNumberInput from '@chaindesk/ui/PhoneNumberInput';
import FileUploaderDropZone from '@chaindesk/ui/FileUploaderDropZone';
import React from 'react';
import { FormFieldSchema } from '@chaindesk/lib/types/dtos';

export const fieldsToZodSchema = (fields: FieldProps[]) => {
  const obj: Record<string, any> = {};
  fields?.map((props) => {
    const { name, required, type } = props;

    let zodType;

    switch (type) {
      case FieldType.Email:
        zodType = z.string().email();
        break;
      case FieldType.TextArea:
        zodType = required ? z.string().min(25) : z.string().optional();
        break;
      case FieldType.Select:
        zodType = required ? z.string().min(1) : z.string().optional();
        break;
      case FieldType.PhoneNumber:
        // const phoneRegex = new RegExp(
        //   /^(?:\+?(\d{1,3}))?[-. (]*(?:\d{1,4})[-. )]*(\d{1,3})[-. ]*(\d{2,4})[-. ]*(\d{2,4})$/
        // );
        // zodType = z.string().regex(phoneRegex, 'Invalid Number!');
        zodType = required ? z.string().min(3) : z.string().optional();
        break;
      case FieldType.Text:
        zodType = required ? z.string().min(1) : z.string().optional();
        break;
      case FieldType.Number:
        const { min, max } = props as Extract<FieldProps, { type: 'number' }>;
        const validation = z.coerce.number().superRefine((x, ctx) => {
          if (typeof min === 'number' && x < min)
            ctx.addIssue({
              type: 'number',
              code: z.ZodIssueCode.too_small,
              minimum: min,
              inclusive: false,
            });
          if (typeof max === 'number' && x > max)
            ctx.addIssue({
              type: 'number',
              code: z.ZodIssueCode.too_big,
              maximum: max,
              inclusive: false,
            });
        });
        zodType = required ? validation : validation.optional();
        break;
      case FieldType.File:
        const fileSchema = z.any();

        zodType = required
          ? z.array(fileSchema).min(1)
          : z.array(fileSchema).optional();
        break;
      default:
        zodType = z.string();
    }
    obj[name] = required ? zodType : zodType.optional();
  });
  return obj;
};

export type FieldProps = FormFieldSchema & {
  changeHandler?: any;
  methods?: any;
};

const fieldTypesMap = {
  email: ({ methods, placeholder }: Extract<FieldProps, { type: 'email' }>) => (
    <Stack>
      <Input
        control={methods.control}
        {...methods?.register('email')}
        sx={{ width: '100%' }}
        placeholder={placeholder}
      />
      <Typography level="body-xs" color="danger" sx={{ textAlign: 'left' }}>
        {methods?.formState?.errors?.email?.message}
      </Typography>
    </Stack>
  ),
  phoneNumber: ({
    name,
    methods,
    placeholder,
  }: Extract<FieldProps, { type: 'phoneNumber' }>) => (
    <Stack>
      <PhoneNumberInput
        control={methods.control as any}
        {...(methods.register(name) as any)}
        // placeholder={t('chatbubble:lead.phoneNumber')}
        placeholder={placeholder}
        handleChange={(value) => {
          methods.setValue(name, value as never, {
            shouldValidate: true,
            shouldDirty: true,
          });
        }}
        // selectProps={{
        //   slotProps: {
        //     listbox: {
        //       // Fix the styling issue with shadow root usage. Similar issue: https://stackoverflow.com/questions/69828392/mui-select-drop-down-options-not-styled-when-using-entry-point-to-insert-scoped
        //       container: chatboxRoot,
        //     },
        //   },
        // }}
      />

      {/* <Input
        {...methods?.register(name)}
        placeholder={placeholder}
        sx={{ width: '100%' }}
      />
      <Typography level="body-xs" color="danger" sx={{ textAlign: 'left' }}>
        {methods?.formState?.errors?.[name]?.message}
      </Typography> */}
    </Stack>
  ),
  text: ({
    name,
    methods,
    placeholder,
  }: Extract<FieldProps, { type: 'text' }>) => (
    <Stack>
      <Input
        control={methods.control}
        sx={{ width: '100%' }}
        {...methods?.register(name || 'text')}
        placeholder={placeholder || ''}
      />
      <Typography level="body-xs" color="danger" sx={{ textAlign: 'left' }}>
        {methods?.formState?.errors?.[name || 'text']?.message}
      </Typography>
    </Stack>
  ),
  number: ({
    name,
    methods,
    placeholder,
    min,
    max,
    ...ohterProps
  }: Extract<FieldProps, { type: 'number' }>) => (
    <>
      <Input
        control={methods.control}
        type="number"
        sx={{ width: '100%' }}
        placeholder={placeholder || ''}
        min={min}
        max={max}
        // slotProps={{
        //   input: {
        //     component: NumericFormatAdapter,
        //   },
        // }}
        {...methods?.register(name)}
      />
    </>
  ),
  textArea: ({
    name,
    methods,
    placeholder,
  }: Extract<FieldProps, { type: 'textArea' }>) => (
    <Stack>
      <Textarea
        sx={{ width: '100%' }}
        {...methods?.register(name)}
        minRows={4}
        placeholder={placeholder || ''}
      />
      <Typography level="body-xs" color="danger" sx={{ textAlign: 'left' }}>
        {methods?.formState?.errors?.[name]?.message}
      </Typography>
    </Stack>
  ),
  select: ({
    name,
    options,
    changeHandler,
    placeholder,
  }: Extract<FieldProps, { type: 'select' }>) => (
    <Select
      sx={{
        width: '100%',
      }}
      placeholder={placeholder}
      onChange={(_, value) => {
        if (value) {
          changeHandler(name, value as string);
        }
      }}
    >
      {options?.map((option, i) => (
        <Option key={i} value={option}>
          {option}
        </Option>
      ))}
    </Select>
  ),
  file: ({
    name,
    placeholder,
    changeHandler,
  }: Extract<FieldProps, { type: 'file' }>) => {
    return (
      <FileUploaderDropZone
        variant="outlined"
        placeholder={placeholder || 'Browse Files'}
        changeCallback={async (files) => {
          changeHandler(name, files);
        }}
      />
    );
  },
};

export default fieldTypesMap;
