import AddCircleRoundedIcon from '@mui/icons-material/AddCircleRounded';
import CloseIcon from '@mui/icons-material/Close';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import {
  Accordion,
  AccordionDetails,
  AccordionGroup,
  AccordionSummary,
  Box,
  Button,
  Checkbox,
  FormControl,
  FormHelperText,
  FormLabel,
  IconButton,
  Option,
  Select,
  Stack,
  Typography,
} from '@mui/joy';
import cuid from 'cuid';
import React from 'react';
import {
  ArrayPath,
  Controller,
  useFieldArray,
  useFormContext,
} from 'react-hook-form';

import { CreateFormSchema } from '@chaindesk/lib/types/dtos';
import { FieldType } from '@chaindesk/ui/embeds/forms/types';
import Input from '@chaindesk/ui/Input';
import {
  countryCodeToFlag,
  defaultCountries,
  parseCountry,
} from '@chaindesk/ui/PhoneNumberInput';

import { SortableList } from '../dnd/SortableList';

export enum formType {
  traditional = 'traditional',
  conversational = 'conversational',
}

const fieldTypes = [
  'email',
  'phoneNumber',
  'text',
  'textArea',
  'select',
  'file',
  'number',
] as const;

type fieldTypes = (typeof fieldTypes)[number];

type Props = {
  type?: 'conversational' | 'traditional';
};

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
  const { control, register, watch } = useFormContext<T>();
  const { append, remove } = useFieldArray({
    control,
    name,
  });

  const fields = watch(name) || [];

  return (
    <Stack gap={1} direction="column" sx={{ width: '100%', maxWidth: '100%' }}>
      <Stack gap={1} width={'100%'}>
        {label && <FormLabel>{label}</FormLabel>}
        {fields?.map((_, i) => (
          <Stack key={i} direction="row" gap={1}>
            <Input
              control={control}
              endDecorator={
                <IconButton
                  size="sm"
                  color="danger"
                  onClick={() => {
                    remove(i);
                  }}
                >
                  <CloseIcon fontSize="sm" />
                </IconButton>
              }
              formControlProps={{
                sx: {
                  overflow: 'hidden',
                  maxWidth: '100%',
                },
              }}
              size="sm"
              variant="soft"
              {...register(`${name}.${i}`)}
            />
          </Stack>
        ))}
      </Stack>
      <div className="flex flex-col justify-start h-full">
        <Button
          size="sm"
          onClick={() => append('' as ArrayPath<T>)}
          variant="plain"
          sx={{
            minWidth: '50px',
            maxWidth: '70%',
            fontSize: 'sm',
          }}
          startDecorator={<AddCircleRoundedIcon fontSize="sm" />}
        >
          {actionLabel}
        </Button>
      </div>
    </Stack>
  );
};
function FieldsInput({ type = 'traditional' }: Props) {
  const methods = useFormContext<CreateFormSchema>();
  const { fields, append, remove, swap } = useFieldArray({
    control: methods.control,
    name: 'draftConfig.fields',
  });

  const fieldsValues = methods.watch('draftConfig.fields') || [];

  return (
    <Stack gap={2}>
      {type === formType.traditional && (
        <SortableList
          items={fieldsValues}
          onChange={(from, to) => {
            swap(from, to);
          }}
          renderItem={(field, index) => (
            <SortableList.Item id={field.id}>
              <SortableList.DragHandle style={{ maxHeight: 0 }} size="sm" />
              <Box
                key={field.id}
                display="flex"
                alignItems="center"
                width="100%"
              >
                <Stack direction={'column'} gap={1} sx={{ width: '100%' }}>
                  <Stack
                    direction="row"
                    sx={{ alignItems: 'start', width: '100%' }}
                  >
                    <AccordionGroup size="sm">
                      <Accordion sx={{ position: 'relative' }}>
                        <AccordionSummary>
                          <Typography className="truncate w-[100px]">
                            {methods?.getValues(
                              `draftConfig.fields.${index}.name`
                            ) || 'New Field'}
                          </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                          <Stack
                            spacing={2}
                            width={{
                              width: '100%',
                              maxWidth: '100%',
                            }}
                          >
                            <FormControl>
                              <FormLabel>Type</FormLabel>
                              <Select
                                sx={{ width: '100%' }}
                                defaultValue={field.type}
                                {...methods.register(
                                  `draftConfig.fields.${index}.type`
                                )}
                                onChange={(_, value) => {
                                  methods.setValue(
                                    `draftConfig.fields.${index}.type`,
                                    value as fieldTypes,
                                    {
                                      shouldDirty: true,
                                      shouldValidate: true,
                                    }
                                  );

                                  if (value === FieldType.Email) {
                                    methods.setValue(
                                      `draftConfig.fields.${index}.name`,
                                      'email',
                                      {
                                        shouldDirty: true,
                                        shouldValidate: true,
                                      }
                                    );
                                  } else if (value === FieldType.PhoneNumber) {
                                    methods.setValue(
                                      `draftConfig.fields.${index}.name`,
                                      'phone',
                                      {
                                        shouldDirty: true,
                                        shouldValidate: true,
                                      }
                                    );
                                  } else if (value === FieldType.Select) {
                                    methods.setValue(
                                      `draftConfig.fields.${index}.options`,
                                      ['Option 1', 'Option 2'],
                                      {
                                        shouldDirty: true,
                                        shouldValidate: true,
                                      }
                                    );
                                  }
                                }}
                              >
                                {fieldTypes.map((each) => (
                                  <Option key={each} value={each}>
                                    {each}
                                  </Option>
                                ))}
                              </Select>
                            </FormControl>

                            <FormControl>
                              <FormLabel>Label</FormLabel>
                              <Input
                                control={methods.control}
                                {...methods.register(
                                  `draftConfig.fields.${index}.name`
                                )}
                              />
                            </FormControl>

                            {fieldsValues?.[index]?.type ===
                              FieldType.Select && (
                              <FormControl>
                                <FormLabel>Options</FormLabel>
                                <Choices<CreateFormSchema>
                                  actionLabel="Add Option"
                                  name={`draftConfig.fields.${index}.options`}
                                />
                              </FormControl>
                            )}

                            {field.type === 'phoneNumber' && (
                              <FormControl>
                                <FormLabel>Default Country Code</FormLabel>
                                <Controller
                                  control={methods.control}
                                  name={`draftConfig.fields.${index}.defaultCountryCode`}
                                  render={({ field }) => (
                                    <Select
                                      onChange={(_, value) => {
                                        field.onChange(value as string);
                                      }}
                                    >
                                      {defaultCountries.map((each) => {
                                        const country = parseCountry(each);
                                        return (
                                          <Option
                                            key={country.iso2}
                                            value={country.iso2}
                                          >
                                            {`${countryCodeToFlag(
                                              country.iso2
                                            )} ${country.name}`}
                                          </Option>
                                        );
                                      })}
                                    </Select>
                                  )}
                                />
                              </FormControl>
                            )}

                            <FormControl>
                              <FormLabel>Placeholder</FormLabel>
                              <Input
                                control={methods.control}
                                {...methods.register(
                                  `draftConfig.fields.${index}.placeholder`
                                )}
                              />
                            </FormControl>

                            <FormControl>
                              <FormLabel>Required</FormLabel>
                              <Checkbox
                                defaultChecked={field.required}
                                onChange={(e) => {
                                  methods.setValue(
                                    `draftConfig.fields.${index}.required`,
                                    e.target.checked
                                  );
                                }}
                              />
                            </FormControl>
                            {fieldsValues?.[index]?.type ===
                              FieldType.Number && (
                              <FormControl>
                                <FormLabel>Min</FormLabel>
                                <Input
                                  control={methods.control}
                                  type="number"
                                  {...methods.register(
                                    `draftConfig.fields.${index}.min`
                                  )}
                                />
                              </FormControl>
                            )}
                            {fieldsValues?.[index]?.type ===
                              FieldType.Number && (
                              <FormControl>
                                <FormLabel>Max</FormLabel>
                                <Input
                                  control={methods.control}
                                  type="number"
                                  {...methods.register(
                                    `draftConfig.fields.${index}.max`
                                  )}
                                />
                              </FormControl>
                            )}
                            {[FieldType.Email, FieldType.PhoneNumber].includes(
                              fieldsValues?.[index]?.type as FieldType
                            ) && (
                              <FormControl>
                                <FormLabel>Create Contact</FormLabel>
                                <Checkbox
                                  defaultChecked={
                                    (field as any).shouldCreateContact
                                  }
                                  onChange={(e) => {
                                    methods.setValue(
                                      `draftConfig.fields.${index}.shouldCreateContact`,
                                      e.target.checked
                                    );
                                  }}
                                />
                              </FormControl>
                            )}
                          </Stack>
                        </AccordionDetails>
                      </Accordion>
                    </AccordionGroup>
                    <IconButton
                      size="sm"
                      onClick={() => {
                        remove(index);
                      }}
                    >
                      <CloseRoundedIcon fontSize="md" color="danger" />
                    </IconButton>
                  </Stack>
                </Stack>
              </Box>
            </SortableList.Item>
          )}
        />
      )}
      {type == formType.conversational &&
        fieldsValues?.map((field, index) => (
          <div key={index}>
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
          </div>
        ))}

      <Button
        size="sm"
        startDecorator={<AddCircleRoundedIcon fontSize="sm" />}
        variant="outlined"
        color="primary"
        onClick={() => {
          append({
            name: `Field ${fields.length + 1}`,
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
