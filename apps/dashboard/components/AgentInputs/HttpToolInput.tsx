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
  Typography,
} from '@mui/joy';
import React, { useCallback, useMemo } from 'react';
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

import useModal from '@app/hooks/useModal';

import {
  CreateAgentSchema,
  HttpToolSchema,
  ToolSchema,
} from '@chaindesk/lib/types/dtos';

import Input from '../Input';

const KeyValueFieldArray = (props: {
  name:
    | 'config.queryParameters'
    | 'config.body'
    | 'config.headers'
    | 'tools.0.config.queryParameters'
    | 'tools.0.config.body'
    | 'tools.0.config.headers';
  label?: string;
}) => {
  const methods = useFormContext<HttpToolSchema | CreateAgentSchema>();
  const parameters = useFieldArray({
    control: methods.control as Control<HttpToolSchema>,
    name: props.name,
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

type Props = {
  name?: 'tools.0';
};

export default function HttpToolInput({ name }: Props) {
  const methods = useFormContext<HttpToolSchema | CreateAgentSchema>();
  const prefix = useMemo(() => {
    return name ? `${name}.` : '';
  }, [name]) as 'tools.0.' | '';
  const templatesModal = useModal();
  const [withApprovalChecked] = methods.watch([`${prefix}config.withApproval`]);
  const [methodValue] = methods.watch([`${prefix}config.method`]);

  return (
    <Stack>
      <Stack
        direction="row"
        sx={{
          mt: -3,
          mb: -2,
        }}
      >
        <Button
          variant="outlined"
          onClick={templatesModal.open}
          sx={{ mx: 'auto' }}
          size="sm"
        >
          Start from a template
        </Button>
      </Stack>

      <Stack gap={2}>
        <Input
          control={methods.control}
          label={'Name'}
          {...methods.register(`${prefix}config.name`)}
        />

        <Input
          control={methods.control}
          label={'Description'}
          helperText="The description helps the Agent to determine when to use the tool."
          {...methods.register(`${prefix}config.description`)}
          placeholder="e.g: Useful for getting the current weather in a given city."
        />

        <Input
          control={methods.control}
          label={'URL to call'}
          {...methods.register(`${prefix}config.url`)}
        />

        <FormControl>
          <FormLabel>Request Method</FormLabel>

          <Select
            defaultValue={'GET'}
            value={methodValue}
            onChange={(_, value) => {
              if (value) {
                methods.setValue(
                  `${prefix}config.method`,
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

        <KeyValueFieldArray label="Headers" name={`${prefix}config.headers`} />

        <KeyValueFieldArray
          label="Query Parameters"
          name={`${prefix}config.queryParameters`}
        />

        <KeyValueFieldArray
          label="Body Parameters"
          name={`${prefix}config.body`}
        />

        {/* <Card size="sm" variant="outlined"> */}
        <FormControl>
          <Checkbox
            label="Approval Required"
            checked={!!withApprovalChecked}
            onChange={(e) => {
              methods.setValue(
                `${prefix}config.withApproval`,
                e.target.checked,
                {
                  shouldDirty: true,
                  shouldValidate: true,
                }
              );
            }}
          />
          <FormHelperText>
            {`When enabled, an administrator's approval is required to proceed with the action`}
          </FormHelperText>
        </FormControl>
        {/* </Card> */}

        <templatesModal.component
          dialogProps={{
            sx: {
              maxWidth: 'sm',
            },
          }}
        >
          <Card>
            <Stack gap={2} direction="row">
              <Stack>
                <Typography level="body-md">Random Cat Picture</Typography>
                <Typography level="body-sm">
                  Ask your agent to fetch a random cat picture from
                  thecatapi.com
                </Typography>
              </Stack>
              <Button
                size="sm"
                sx={{ ml: 'auto', alignSelf: 'center' }}
                onClick={() => {
                  methods.setValue(
                    `${prefix}config`,
                    {
                      name: 'Random Cat Image',
                      description: 'Useful for getting a random cat image',
                      url: 'https://api.thecatapi.com/v1/images/search',
                      headers: [],
                      queryParameters: [],
                      body: [],
                    },
                    {
                      shouldDirty: true,
                      shouldValidate: true,
                    }
                  );

                  templatesModal.close();
                }}
              >
                Select
              </Button>
            </Stack>
          </Card>
        </templatesModal.component>
      </Stack>
    </Stack>
  );
}
