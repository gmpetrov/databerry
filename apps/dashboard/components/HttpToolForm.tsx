import { zodResolver } from '@hookform/resolvers/zod';
import {
  Alert,
  Button,
  Chip,
  Divider,
  Input,
  Option,
  Select,
  Stack,
  Typography,
} from '@mui/joy';
import Snackbar from '@mui/joy/Snackbar';
import axios from 'axios';
import pDebounce from 'p-debounce';
import React, { memo, useCallback, useRef } from 'react';
import { FormProvider, useForm, useFormContext } from 'react-hook-form';

import useModal from '@app/hooks/useModal';

import {
  CreateAgentSchema,
  HttpToolSchema,
  ToolSchema,
} from '@chaindesk/lib/types/dtos';
import useDeepCompareEffect from '@chaindesk/ui/hooks/useDeepCompareEffect';
import useStateReducer from '@chaindesk/ui/hooks/useStateReducer';
import Markdown from '@chaindesk/ui/Markdown';

import HttpToolInput, { type Fields } from './AgentInputs/HttpToolInput';

type Props = {
  defaultValues?: Partial<HttpToolSchema>;
  onSubmit?: (data: HttpToolSchema) => any;
};

type ParamTypes =
  | 'pathVariables'
  | 'queryParameters'
  | 'bodyParameters'
  | 'headerParameters';

const ParamFields = memo(
  ({
    title,
    parameters,
    type,
    buildTestPayload,
  }: {
    title: string;
    parameters: Fields;
    type: ParamTypes;
    buildTestPayload: ({
      key,
      value,
      type,
    }: {
      key: string;
      value: string;
      type: ParamTypes;
    }) => void;
  }) => {
    return (
      <>
        <Stack gap={2} pl={2}>
          <Typography>{title}</Typography>
          {parameters?.map((field, index) => (
            <Stack
              direction="row"
              key={`${index}${field.key}`}
              gap={2}
              alignItems={'end'}
              pl={2}
            >
              <Typography width="80%">{field.key}</Typography>
              {(field.acceptedValues || []).length > 0 ? (
                <Select
                  sx={{
                    width: '100%',
                  }}
                  placeholder="select a specified value"
                  onChange={(_, value) => {
                    if (value) {
                      buildTestPayload({
                        key: field.key,
                        type,
                        value: value as string,
                      });
                    }
                  }}
                >
                  {field.acceptedValues?.map((value, i) => (
                    <Option key={i} value={value}>
                      {value}
                    </Option>
                  ))}
                </Select>
              ) : (
                <Input
                  disabled={!field.isUserProvided}
                  placeholder={field.value}
                  sx={{
                    width: '100%',
                  }}
                  onChange={pDebounce((e) => {
                    buildTestPayload({
                      key: field.key,
                      type,
                      value: e.target.value,
                    });
                  }, 500)}
                />
              )}
            </Stack>
          ))}
        </Stack>
        <Divider />
      </>
    );
  }
);

export function HttpToolTestForm<T extends HttpToolSchema | CreateAgentSchema>({
  setToolValidState,
  handleCloseModal,
  name,
}: {
  setToolValidState(arg: boolean): void;
  handleCloseModal?: () => void;
  name?: `tools.${number}`;
}) {
  const methods =
    useFormContext<
      T extends HttpToolSchema ? HttpToolSchema : CreateAgentSchema
    >();
  const prefix: `tools.${number}.` | '' = name ? `${name}.` : '';
  const config = methods.getValues(
    `${prefix}config` as any
  ) as HttpToolSchema['config'];

  const { url, method } = config;

  const headers = config.headers?.reduce((acc, header) => {
    if (header.key && header.value !== undefined) {
      acc[header.key] = header.value;
    }
    return acc;
  }, {} as Record<string, unknown>);

  const body = config.body?.reduce((acc, body) => {
    if (body.key && body.value !== undefined) {
      acc[body.key] = body.value;
    }
    return acc;
  }, {} as Record<string, unknown>);

  const [state, setState] = useStateReducer({
    url,
    headers,
    body,
    pathVariables: {},
    queryParams: {},
    method,
    loading: false,
    testResult: '',
    responseStatus: 200,
    isSnackBarOpen: false,
  });

  const buildTestRequest = useCallback(
    ({
      key,
      value,
      type,
    }: {
      key: string;
      value: string;
      type: ParamTypes;
    }) => {
      switch (type) {
        case 'queryParameters':
          {
            const queryParams = { ...state.queryParams, ...{ [key]: value } };
            let newUrl = new URL(state.url);

            for (const key in queryParams) {
              newUrl.searchParams.set(
                key,
                queryParams[key as keyof typeof queryParams]
              );
            }
            setState({
              url: decodeURI(newUrl.toString()),
              queryParams,
            });
          }
          break;
        case 'pathVariables':
          {
            const pathVariables = {
              ...state.pathVariables,
              ...{ [key]: value },
            };
            let baseUrl = url.split('?')[0];

            // should not affect the queryParameters
            let searchParams =
              state.url.split('?')[1]?.length > 0
                ? `?${state.url.split('?')[1]}`
                : '';

            for (const key in pathVariables) {
              baseUrl = baseUrl.replace(
                `:${key}`,
                pathVariables[key as keyof typeof pathVariables]
              );
            }
            setState({
              url: `${baseUrl}${searchParams}`,
              pathVariables,
            });
          }

          break;
        case 'bodyParameters':
          const body = { ...state.body, ...{ [key]: value } };
          setState({ body });
          break;
        case 'headerParameters':
          const headers = { ...state.headers, ...{ [key]: value } };
          setState({ headers });
          break;
      }
    },
    [setState, state, url]
  );

  const testEndpoint = async () => {
    try {
      setState({ loading: true });
      const response = await axios.post('/api/tools/http-tool/validator', {
        url: state.url,
        method: state.method,
        body: state.body,
        headers: state.headers,
      });

      setState({
        responseStatus: response.data.status,
        testResult: '```\n' + JSON.stringify(response.data, null, 2) + '\n```',
      });

      setToolValidState(response.data.status === 200 ? true : false);
    } catch (e) {
      console.error(e);
    } finally {
      setState({ loading: false, isSnackBarOpen: true });
    }
  };

  const paramFields: { type: ParamTypes; title: string; parameters: Fields }[] =
    [
      {
        type: 'headerParameters',
        title: 'Headers Parameters',
        parameters: config.headers,
      },
      {
        type: 'pathVariables',
        title: 'Path Variables',
        parameters: config.pathVariables,
      },
      {
        type: 'queryParameters',
        title: 'Query Parameters',
        parameters: config.queryParameters,
      },
      {
        type: 'bodyParameters',
        title: 'Body Parameters',
        parameters: config.body,
      },
    ];

  return (
    <Stack>
      <Stack pl={2} width="100%">
        <Alert
          startDecorator={
            <Chip
              color={
                {
                  GET: 'success',
                  POST: 'success',
                  PATCH: 'warning',
                  PUT: 'warning',
                  DELETE: 'danger',
                }[state.method] as 'success' | 'warning' | 'danger'
              }
            >
              {state.method}
            </Chip>
          }
        >
          <Typography>{state.url}</Typography>
        </Alert>
      </Stack>

      <Divider sx={{ my: 2 }} />

      <Stack gap={2}>
        {paramFields.map(({ type, title, parameters }) => (
          <React.Fragment key={type}>
            {parameters && parameters?.length > 0 && (
              <ParamFields
                type={type}
                title={title}
                parameters={parameters}
                buildTestPayload={buildTestRequest}
              />
            )}
          </React.Fragment>
        ))}
      </Stack>

      <Button
        sx={{ mt: 2 }}
        onClick={testEndpoint}
        loading={state.loading}
        color="neutral"
        variant="solid"
      >
        Test
      </Button>

      {!!state.testResult && (
        <Stack sx={{ mt: 4 }} gap={1}>
          <Stack direction="row" gap={1} width="100%">
            <Typography level="body-sm">Test Result</Typography>
            <Chip color={state.responseStatus === 200 ? 'success' : 'danger'}>
              {state.responseStatus}
            </Chip>
          </Stack>

          <Markdown>{state.testResult}</Markdown>
        </Stack>
      )}

      <Snackbar
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        open={state.isSnackBarOpen}
        onClose={() => setState({ isSnackBarOpen: false })}
        color={state.responseStatus === 200 ? 'success' : 'danger'}
      >
        {state.responseStatus === 200
          ? 'Congratualations! yourt test succeeded, you can close this modal.'
          : 'Ouch! your test  failed :('}

        {state.responseStatus === 200 && (
          <Button
            size="sm"
            color="success"
            variant="solid"
            onClick={handleCloseModal}
          >
            Continue
          </Button>
        )}
      </Snackbar>
    </Stack>
  );
}

function HttpToolForm({ onSubmit, defaultValues }: Props) {
  const methods = useForm<HttpToolSchema>({
    resolver: zodResolver(ToolSchema),
    mode: 'onChange',
    defaultValues: {
      ...defaultValues,
      type: 'http',
    },
  });

  const config = methods.watch([
    'config.body',
    'config.headers',
    'config.method',
    'config.pathVariables',
    'config.queryParameters',
  ]);

  const isToolValidRef = useRef(false);
  const validateToolModal = useModal();
  console.log('ERRORS', methods.formState.errors);
  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      e.stopPropagation();

      methods.trigger();

      if (!isToolValidRef.current && methods.formState.isValid) {
        validateToolModal.open();
        return;
      } else if (isToolValidRef.current) {
        methods.handleSubmit((data) => {
          onSubmit?.(data);
        })(e);
      }
    },
    [onSubmit]
  );

  // config changed, allow re-test.
  useDeepCompareEffect(() => {
    isToolValidRef.current = false;
  }, [config]);

  return (
    <FormProvider {...methods}>
      <Stack component="form" onSubmit={handleSubmit} gap={2}>
        <HttpToolInput />

        <Button type="submit" color="success">
          {isToolValidRef.current ? 'Create' : 'Validate Config'}
        </Button>

        <validateToolModal.component
          title="Set up a request to your endpoint"
          description="Send a request to your endpoint to make sure it's working well."
          dialogProps={{
            sx: {
              maxWidth: '50%',
            },
          }}
        >
          <HttpToolTestForm
            setToolValidState={(state: boolean) => {
              isToolValidRef.current = state;
            }}
            handleCloseModal={validateToolModal.close}
          />
        </validateToolModal.component>
      </Stack>
    </FormProvider>
  );
}

export default HttpToolForm;
