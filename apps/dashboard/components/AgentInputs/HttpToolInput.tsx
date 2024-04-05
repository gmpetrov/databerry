import DeleteIcon from '@mui/icons-material/Delete';
import InfoRoundedIcon from '@mui/icons-material/InfoRounded';
import SettingsIcon from '@mui/icons-material/Settings';
import {
  Accordion,
  AccordionGroup,
  Alert,
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
import AccordionDetails, {
  accordionDetailsClasses,
} from '@mui/joy/AccordionDetails';
import AccordionSummary, {
  accordionSummaryClasses,
} from '@mui/joy/AccordionSummary';
import pDebounce from 'p-debounce';
import React, {
  ElementRef,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Control,
  FieldValue,
  FieldValues,
  FormProvider,
  useFieldArray,
  useForm,
  useFormContext,
} from 'react-hook-form';

import useModal from '@app/hooks/useModal';

import {
  CreateAgentSchema,
  HttpToolSchema,
  ToolSchema,
} from '@chaindesk/lib/types/dtos';

import { Choices } from '../BlablaFormEditor/FieldsInput';
import Input from '../Input';

export type Fields =
  | {
      key: string;
      value?: string | undefined;
      isUserProvided?: boolean | undefined;
      description?: string;
      acceptedValues?: (string | undefined)[];
    }[]
  | undefined;

type KeyValueNames =
  | 'config.queryParameters'
  | 'config.pathVariables'
  | 'config.body'
  | 'config.headers'
  | `tools.${number}.config.queryParameters`
  | `tools.${number}.config.pathVariables`
  | `tools.${number}.config.body`
  | `tools.${number}.config.headers`;

const KeyValueFieldArray = ({
  name,
  label,
  userOnly = false,
  prefix,
}: {
  name:
    | 'config.queryParameters'
    | 'config.pathVariables'
    | 'config.body'
    | 'config.headers'
    | `tools.${number}.config.queryParameters`
    | `tools.${number}.config.pathVariables`
    | `tools.${number}.config.body`
    | `tools.${number}.config.headers`;
  label?: string;
  userOnly?: boolean;
  prefix: `tools.${number}.` | '';
}) => {
  const methods = useFormContext<HttpToolSchema | CreateAgentSchema>();

  const parameters = useFieldArray({
    control: methods.control as Control<HttpToolSchema>,
    name,
  });

  const url = methods.watch(`${prefix}config.url`);

  useEffect(() => {
    try {
      if (name.includes('queryParameters')) {
        const Url = new URL(url);
        const searchParams = Url.searchParams;

        //TODO: https://github.com/microsoft/TypeScript/issues/54466
        const diff = parameters?.fields?.length - (searchParams as any).size;

        if (diff < 0) {
          parameters.append(
            {
              key: '',
              value: '',
            },
            {
              shouldFocus: false,
            }
          );
        } else if (diff > 0) {
          const indexsToRemove = parameters.fields.reduce(
            (acc, field, index) => {
              if (!searchParams.has(field.key)) {
                acc.push(index);
              }
              return acc;
            },
            [] as number[]
          );
          parameters.remove(indexsToRemove);
        }

        Array.from(searchParams.entries()).forEach(([key, value], index) => {
          const fieldKey = methods.getValues(`${name}.${index}.key`);
          const fieldValue = methods.getValues(`${name}.${index}.value`);
          const isUserPovided = methods.getValues(
            `${name}.${index}.isUserProvided`
          );

          // handle key field.
          if (fieldKey !== key) methods.setValue(`${name}.${index}.key`, key);

          if (value === '{user}') {
            if (!isUserPovided) {
              parameters.update(index, {
                key: fieldKey,
                value: '',
                isUserProvided: true,
              });
            }
          } else if (fieldValue !== value) {
            if (isUserPovided) {
              parameters.update(index, {
                key: fieldKey,
                value,
                isUserProvided: false,
              });
            } else {
              methods.setValue(`${name}.${index}.value`, value);
            }
          }
        });
      } else if (name.includes('pathVariables')) {
        const urlPaths: string[] = (url.match(/:(\w+)/g) || []).map(
          (path: string) => path.substring(1)
        );
        const diff = parameters.fields.length - urlPaths.length;

        if (diff < 0) {
          parameters.append(
            {
              key: '',
              value: '',
              isUserProvided: true,
            },
            {
              shouldFocus: false,
            }
          );
        } else if (diff > 0) {
          const indexsToRemove = parameters.fields.reduce(
            (acc, field, index) => {
              if (!urlPaths.includes(field.key)) {
                acc.push(index);
              }
              return acc;
            },
            [] as number[]
          );
          parameters.remove(indexsToRemove);
        }

        urlPaths.forEach((path, index) => {
          const fieldKeyPath = `${name}.${index}.key` as const;
          if (fieldKeyPath !== path) methods.setValue(fieldKeyPath, path);
        });
      }
    } catch (e) {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  return (
    <FormControl>
      {label && <FormLabel>{label}</FormLabel>}
      <Stack gap={1}>
        {parameters.fields.map((field, index) => (
          <Stack key={field.id} gap={1}>
            <Stack direction="row" gap={1} alignItems={'end'}>
              <Input
                control={methods.control}
                placeholder="Key"
                {...methods.register(`${name}.${index}.key` as any)}
                onChange={pDebounce((e) => {
                  try {
                    if (name.includes('queryParameters')) {
                      const Url = new URL(url);
                      const searchParams = Url.search
                        ?.replace('?', '')
                        ?.split('&');

                      // New key, add it.
                      if (searchParams.length === 0) {
                        methods.setValue(
                          `${prefix}config.url`,
                          `${Url.toString()}?${e.target.value}=`
                        );
                        return;
                      }

                      const [_, valueInUrl] =
                        searchParams[index]?.split('=') || [];

                      searchParams[index] = `${e.target.value}=${
                        valueInUrl || ''
                      }`;

                      Url.search = `?${searchParams.join('&')}`;

                      methods.setValue(
                        `${prefix}config.url`,
                        decodeURI(Url.toString())
                      );
                    } else if (name.includes('pathVariables')) {
                      const Url = new URL(url);
                      const cleanPath = Url.pathname
                        .replace(/\/:([^\/]*)/g, '') // no /:vars
                        .replace(/\/$/, ''); // no '/' at the end.

                      const baseUrl = Url.origin + cleanPath;

                      const urlPaths = url.match(/:(\w+)/g) || [];
                      urlPaths[index] = `:${e.target.value.replace(':', '')}`;

                      const newUrl =
                        baseUrl + '/' + urlPaths.join('/') + Url.search;

                      methods.setValue(`${prefix}config.url`, newUrl);
                    }
                  } catch (e) {}
                }, 500)}
              />

              <Input
                control={methods.control}
                placeholder="Value"
                {...methods.register(`${name}.${index}.value` as any)}
                disabled={!!field.isUserProvided}
                onChange={pDebounce((e) => {
                  try {
                    const Url = new URL(url);
                    const searchParams = Url.search.replace('?', '').split('&');
                    const [keyInUrl, valueInUrl] =
                      searchParams[index].split('=');

                    if (valueInUrl !== e.target.value) {
                      searchParams[index] = `${keyInUrl}=${e.target.value}`;
                    }

                    Url.search = `?${searchParams.join('&')}`;

                    methods.setValue(
                      `${prefix}config.url`,
                      decodeURI(Url.toString())
                    );
                  } catch (e) {
                    console.log('error', e);
                  }
                }, 500)}
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
                      const fieldValues = methods.getValues(`${name}.${index}`);
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
                onClick={() => {
                  parameters.remove(index);
                  try {
                    if (name.includes('queryParameters')) {
                      const Url = new URL(url);
                      const searchParams = Url.search
                        .replace('?', '')
                        .split('&');

                      // use index instead of key, to avoid out_of_sync issue
                      const synchronizedKey = searchParams[index].split('=')[0];

                      Url.searchParams.delete(synchronizedKey);

                      methods.setValue(
                        `${prefix}config.url`,
                        decodeURI(Url.toString())
                      );
                    } else if (name.includes('pathVariables')) {
                      const Url = new URL(url);
                      const cleanPath = Url.pathname
                        .replace(/\/:([^\/]*)/g, '') // no /:vars
                        .replace(/\/$/, ''); // no '/' at the end.

                      const baseUrl = Url.origin + cleanPath;

                      const urlPaths = url.match(/:(\w+)/g) || [];

                      // use index instead of key, to avoid out_of_sync issue
                      urlPaths.splice(index, 1);

                      const newUrl =
                        baseUrl + '/' + urlPaths.join('/') + Url.search;

                      methods.setValue(`${prefix}config.url`, newUrl);
                    }
                  } catch (e) {
                    console.error(e);
                  }
                }}
              >
                <DeleteIcon />
              </IconButton>
            </Stack>
            {field.isUserProvided && (
              <AccordionGroup
                transition="0.4s ease"
                sx={{
                  [`& .${accordionSummaryClasses.indicator}`]: {
                    transition: '0.2s',
                  },
                  [`& [aria-expanded="true"] .${accordionSummaryClasses.indicator}`]:
                    {
                      transform: 'rotate(180deg)',
                    },
                }}
              >
                <Accordion sx={{ ml: 1 }}>
                  <AccordionSummary>
                    <Typography
                      level="body-sm"
                      color="primary"
                      startDecorator={
                        <SettingsIcon fontSize="sm" color="primary" />
                      }
                    >
                      Advanced
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Stack gap={2}>
                      <Divider />
                      <Input
                        control={methods.control}
                        label="Describe your key usage for better AI inference :"
                        placeholder="Description"
                        {...methods.register(
                          `${name}.${index}.description` as any
                        )}
                      />

                      <Choices<HttpToolSchema | CreateAgentSchema>
                        actionLabel="Add A Value"
                        name={`${name}.${index}.acceptedValues`}
                        init={false}
                        label="Specify the accepted values for the key :"
                      />
                      <Divider sx={{ my: 2 }} />
                    </Stack>
                  </AccordionDetails>
                </Accordion>
              </AccordionGroup>
            )}
          </Stack>
        ))}
        <Button
          variant="outlined"
          color="neutral"
          onClick={() =>
            parameters.append({
              key: '',
              value: '',
              ...(userOnly ? { isUserProvided: userOnly } : {}),
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
  name?: `tools.${number}`;
};

function HttpToolInput({ name }: Props) {
  const methods = useFormContext<HttpToolSchema | CreateAgentSchema>();
  const prefix: `tools.${number}.` | '' = name ? `${name}.` : '';
  const templatesModal = useModal();
  const [withApprovalChecked] = methods.watch([`${prefix}config.withApproval`]);
  const [methodValue] = methods.watch([`${prefix}config.method`]);

  // Fallback request method to GET.
  useEffect(() => {
    const requestMethod = methods.getValues(`${prefix}config.method`);
    if (!requestMethod) {
      methods.setValue(`${prefix}config.method`, 'GET', {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
  }, [methods, prefix]);

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
          {...methods.register(`${prefix}config.description`)}
          placeholder="e.g: Useful for getting the current weather in a given city."
        />
        <Alert color="warning" startDecorator={<InfoRoundedIcon />}>
          <Stack>
            <p>
              The description is very important, this is what the Agent will use
              to decide when to use it and what to do.
            </p>
            <p>{`For instance for tool that retrieves the current weather of a given city: "Useful for getting the current weather in a given city." is better than "Weather API"`}</p>
          </Stack>
        </Alert>

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

        <KeyValueFieldArray
          label="Path Variables"
          prefix={prefix}
          name={`${prefix}config.pathVariables`}
          userOnly
        />

        <KeyValueFieldArray
          label="Query Parameters"
          prefix={prefix}
          name={`${prefix}config.queryParameters`}
        />

        {!['GET', 'DELETE'].includes(
          methods.getValues(`${prefix}config.method`)
        ) && (
          <KeyValueFieldArray
            label="Body Parameters"
            prefix={prefix}
            name={`${prefix}config.body`}
          />
        )}

        <KeyValueFieldArray
          label="Headers"
          prefix={prefix}
          name={`${prefix}config.headers`}
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
              height: 'auto',
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
                      method: 'GET',
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

export default memo(HttpToolInput);
