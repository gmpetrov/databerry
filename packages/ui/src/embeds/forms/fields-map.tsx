import {
  Textarea,
  Select,
  Option,
  FormControl,
  FormHelperText,
  Stack,
} from '@mui/joy';
import mime from 'mime';
import { FieldType, fieldUnion } from './types';
import { z } from 'zod';

import Input from '@chaindesk/ui/Input';
import PhoneNumberInput from '@chaindesk/ui/PhoneNumberInput';
import FileUploaderDropZone from '@chaindesk/ui/FileUploaderDropZone';
import React from 'react';
import { FormFieldSchema } from '@chaindesk/lib/types/dtos';
import ChatMessageAttachment from '@chaindesk/ui/Chatbox/ChatMessageAttachment';
import { zIndex } from '@chaindesk/ui/embeds/common/utils';

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
  disabled?: boolean;
};

const fieldTypesMap = {
  email: ({
    methods,
    placeholder,
    disabled,
  }: Extract<FieldProps, { type: 'email' }>) => (
    <Input
      disabled={disabled}
      control={methods.control}
      {...methods?.register('email')}
      sx={{ width: '100%' }}
      placeholder={placeholder}
    />
  ),
  phoneNumber: ({
    name,
    methods,
    placeholder,
    defaultCountryCode,
    disabled,
  }: Extract<FieldProps, { type: 'phoneNumber' }>) => {
    const error = methods?.formState?.errors?.[name]?.message;

    return (
      <FormControl>
        <PhoneNumberInput
          disabled={disabled}
          control={methods.control as any}
          {...(methods.register(name) as any)}
          defaultCountryCode={defaultCountryCode}
          placeholder={placeholder}
          handleChange={(value) => {
            methods.setValue(name, value as never, {
              shouldValidate: true,
              shouldDirty: true,
            });
          }}
        />
        {error && <FormHelperText>{error}</FormHelperText>}
      </FormControl>
    );
  },
  text: ({
    name,
    methods,
    placeholder,
    disabled,
  }: Extract<FieldProps, { type: 'text' }>) => (
    <Input
      control={methods.control}
      disabled={disabled}
      sx={{ width: '100%' }}
      {...methods?.register(name || 'text')}
      placeholder={placeholder || ''}
    />
  ),
  number: ({
    name,
    methods,
    placeholder,
    min,
    max,
    disabled,
    ...ohterProps
  }: Extract<FieldProps, { type: 'number' }>) => (
    <Input
      control={methods.control}
      disabled={disabled}
      type="number"
      sx={{ width: '100%' }}
      placeholder={placeholder || ''}
      min={min}
      max={max}
      {...methods?.register(name)}
    />
  ),
  textArea: ({
    name,
    methods,
    placeholder,
    disabled,
  }: Extract<FieldProps, { type: 'textArea' }>) => {
    const error = methods?.formState?.errors?.[name]?.message;
    return (
      <FormControl error={!!error}>
        <Textarea
          disabled={disabled}
          sx={{ width: '100%' }}
          {...methods?.register(name)}
          minRows={4}
          placeholder={placeholder || ''}
        />
        {error && <FormHelperText>{error}</FormHelperText>}
      </FormControl>
    );
  },
  select: ({
    name,
    options,
    changeHandler,
    placeholder,
    methods,
    disabled,
  }: Extract<FieldProps, { type: 'select' }>) => {
    const error = methods?.formState?.errors?.[name]?.message;

    return (
      <FormControl error={!!error}>
        <Select
          disabled={disabled}
          sx={{
            width: '100%',
          }}
          slotProps={{
            listbox: {
              sx: {
                zIndex: zIndex + 1,
              },
            },
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
        {error && <FormHelperText>{error}</FormHelperText>}
      </FormControl>
    );
  },
  file: ({
    name,
    placeholder,
    changeHandler,
    methods,
    disabled,
  }: Extract<FieldProps, { type: 'file' }>) => {
    const error = methods?.formState?.errors?.[name]?.message;

    // Get values for read-only mode
    const uploadedFiles = disabled ? methods.watch(name) : [];
    let urls = [] as string[];
    try {
      urls = JSON.parse(uploadedFiles);
    } catch {}

    return (
      <FormControl error={!!error}>
        {!disabled && (
          <FileUploaderDropZone
            variant="outlined"
            placeholder={placeholder || 'Browse Files'}
            changeCallback={async (files) => {
              changeHandler(name, files);
            }}
          />
        )}
        {disabled && (
          <Stack gap={1}>
            {urls?.map?.((url: string, i: number) => (
              <ChatMessageAttachment
                key={i}
                attachment={{
                  url,
                  name: url,
                  mimeType: mime.getType(url) as string,
                  size: 42,
                }}
              />
            ))}
          </Stack>
        )}
        {error && <FormHelperText>{error}</FormHelperText>}
      </FormControl>
    );
  },
};

export default fieldTypesMap;
