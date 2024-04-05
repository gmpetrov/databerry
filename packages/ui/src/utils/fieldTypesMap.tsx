import { Stack, Typography, Textarea, Select, Option } from '@mui/joy';
import { FieldType, fieldUnion } from '../types/form';
import { z } from 'zod';
import Input from '@chaindesk/ui/Input';
import PhoneNumberInput from '@chaindesk/ui/PhoneNumberInput';
import FileUploaderDropZone from '@chaindesk/ui/FileUploaderDropZone';

export const fieldsToZodSchema = (
  fields: { name: string; required: boolean; type: fieldUnion }[]
) => {
  const obj: Record<string, any> = {};
  fields?.map(({ name, required, type }) => {
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
        zodType = required ? z.number() : z.number().optional();
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

const fieldTypesMap = {
  email: ({ methods, placeholder }: { methods: any; placeholder: string }) => (
    <Stack>
      <Input
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
  }: {
    name: string;
    methods: any;
    placeholder: string;
  }) => (
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
  }: {
    name: string;
    methods: any;
    placeholder: string;
  }) => (
    <Stack>
      <Input
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
  }: {
    name: string;
    methods: any;
    placeholder: string;
  }) => (
    <Stack>
      <Input
        type="number"
        sx={{ width: '100%' }}
        onChange={(e) => {
          methods.setValue(name, parseInt(e.target.value));
          methods.trigger();
        }}
        control={methods.control}
        placeholder={placeholder || ''}
      />
      <Typography level="body-xs" color="danger" sx={{ textAlign: 'left' }}>
        {methods?.formState?.errors?.[name]?.message}
      </Typography>
    </Stack>
  ),
  textArea: ({
    name,
    methods,
    placeholder,
  }: {
    name: string;
    methods: any;
    placeholder?: string;
  }) => (
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
  }: {
    name: string;
    options: string[];
    changeHandler(name: string, value: string): void;
    placeholder: string;
  }) => (
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
  }: {
    name: string;
    placeholder?: string;
    formId: string;
    conversationId?: string;
    changeHandler(name: string, value: File[]): void;
  }) => {
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
