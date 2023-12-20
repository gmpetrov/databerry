import { zodResolver } from '@hookform/resolvers/zod';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  Button,
  Card,
  Checkbox,
  Divider,
  FormControl,
  FormHelperText,
  FormLabel,
  IconButton,
  Option,
  Select,
  Sheet,
  Stack,
} from '@mui/joy';
import React, { useCallback } from 'react';
import {
  Control,
  FieldValue,
  FieldValues,
  FormProvider,
  useFieldArray,
  useForm,
  useFormContext,
} from 'react-hook-form';
import z from 'zod';

import { HttpToolSchema, ToolSchema } from '@chaindesk/lib/types/dtos';

import Input from './Input';

type Props = {
  defaultValues?: Partial<HttpToolSchema>;
  onSubmit?: (data: HttpToolSchema) => any;
};

const KeyValueFieldArray = (props: {
  name: 'config.queryParameters' | 'config.body' | 'config.headers';
  label?: string;
}) => {
  const methods = useFormContext<HttpToolSchema>();
  const parameters = useFieldArray({
    control: methods.control, // control props comes from useForm (optional: if you are using FormContext)
    name: props.name, // unique name for your Field Array
  });

  return (
    <FormControl>
      {props.label && <FormLabel>{props.label}</FormLabel>}
      <Stack gap={1}>
        {parameters.fields.map((field, index) => (
          <Stack key={field.id} direction="row" gap={1} alignItems={'end'}>
            <Input
              control={methods.control}
              placeholder="Key"
              {...methods.register(`${props.name}.${index}.key` as const)}
            />

            <Input
              control={methods.control}
              placeholder="Value"
              {...methods.register(`${props.name}.${index}.value` as const)}
              disabled={!!field.isUserProvided}
            />

            <FormControl>
              <Card variant="outlined" size="sm">
                <Checkbox
                  size="sm"
                  label="Provided By User"
                  checked={!!field.isUserProvided}
                  slotProps={{
                    label: {
                      sx: {
                        whiteSpace: 'nowrap',
                      },
                    },
                  }}
                  onChange={(e) => {
                    const fieldValues = methods.getValues(
                      `${props.name}.${index}`
                    );
                    parameters.update(index, {
                      ...fieldValues,
                      value: '',
                      isUserProvided: e.target.checked,
                    });
                  }}
                />
              </Card>
            </FormControl>

            <IconButton
              variant="outlined"
              color="neutral"
              onClick={() => parameters.remove(index)}
            >
              <DeleteIcon />
            </IconButton>
          </Stack>
        ))}
        <Button
          variant="outlined"
          color="neutral"
          onClick={() =>
            parameters.append({
              key: '',
              value: '',
            })
          }
        >
          + Add
        </Button>
      </Stack>
    </FormControl>
  );
};

function APIToolForm({ onSubmit, defaultValues }: Props) {
  const methods = useForm<HttpToolSchema>({
    resolver: zodResolver(ToolSchema),
    mode: 'onChange',
    defaultValues: {
      ...defaultValues,
      type: 'http',
    },
  });

  console.log('ERRORS', methods.formState.errors);
  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      e.stopPropagation();

      methods.handleSubmit((data) => {
        onSubmit?.(data);
      })(e);
    },
    [onSubmit]
  );

  return (
    <FormProvider {...methods}>
      <Stack component="form" onSubmit={handleSubmit} gap={2}>
        <Stack gap={2}>
          <Input
            control={methods.control}
            label={'Name'}
            {...methods.register('config.name')}
          />

          <Input
            control={methods.control}
            label={'Description'}
            helperText="The description helps the Agent to determine when to use the tool."
            {...methods.register('config.description')}
            placeholder="e.g: Useful for getting the current weather in a given city."
          />

          <Input
            control={methods.control}
            label={'URL to call'}
            {...methods.register('config.url')}
          />

          <FormControl>
            <FormLabel>Request Method</FormLabel>

            <Select
              defaultValue={'GET'}
              onChange={(_, value) => {
                if (value) {
                  methods.setValue(
                    'config.method',
                    value as HttpToolSchema['config']['method'],
                    {
                      shouldValidate: true,
                      shouldDirty: true,
                    }
                  );
                }
              }}
            >
              <Option value="GET">GET</Option>
              <Option value="POST">POST</Option>
              <Option value="PUT">PUT</Option>
              <Option value="PATCH">PATCH</Option>
              <Option value="DELETE">DELETE</Option>
            </Select>
          </FormControl>

          <KeyValueFieldArray label="Headers" name="config.headers" />

          <KeyValueFieldArray
            label="Query Parameters"
            name="config.queryParameters"
          />

          <KeyValueFieldArray label="Body Parameters" name="config.body" />

          {/* <Card size="sm" variant="outlined"> */}
          <FormControl>
            <Checkbox
              label="Approval Required"
              onChange={(e) => {
                methods.setValue('config.withApproval', e.target.checked, {
                  shouldDirty: true,
                  shouldValidate: true,
                });
              }}
            />
            <FormHelperText>
              {`When enabled, an administrator's approval is required to proceed with the action`}
            </FormHelperText>
          </FormControl>
          {/* </Card> */}
        </Stack>

        <Button type="submit" color="success">
          Save
        </Button>
      </Stack>
    </FormProvider>
  );
}

export default APIToolForm;
