import { zodResolver } from '@hookform/resolvers/zod';
import AddCircleOutlineRoundedIcon from '@mui/icons-material/AddCircleOutlineRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import ConstructionOutlined from '@mui/icons-material/ConstructionOutlined';
import RemoveCircleOutlineRoundedIcon from '@mui/icons-material/RemoveCircleOutlineRounded';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import StorageRoundedIcon from '@mui/icons-material/StorageRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  Divider,
  FormControl,
  FormLabel,
  IconButton,
  Option,
  Select,
  Sheet,
  Stack,
  Typography,
} from '@mui/joy';
import Textarea from '@mui/joy/Textarea';
import {
  Agent,
  AgentVisibility,
  AppDatasource as Datasource,
  DatasourceType,
  Prisma,
  ToolType,
} from '@prisma/client';
import axios from 'axios';
import mime from 'mime-types';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import React, { useEffect, useState } from 'react';
import { FormProvider, useForm, useFormContext } from 'react-hook-form';
import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import { z } from 'zod';

import Input from '@app/components/Input';
import { upsertDatasource } from '@app/pages/api/datasources';
import { getDatastores } from '@app/pages/api/datastores';
import { GenerateUploadLinkRequest } from '@app/pages/api/datastores/[id]/generate-upload-link';
import { RouteNames } from '@app/types';
import { UpsertAgentSchema } from '@app/types/dtos';
import cuid from '@app/utils/cuid';
import { fetcher, postFetcher } from '@app/utils/swr-fetcher';

type Props = {
  defaultValues?: UpsertAgentSchema;
  onSubmitSucces?: (agent: Agent) => any;
};

// const BASE_PROMPT_TEMPLATE = `Imagine you are an AI customer support assistant, specifically trained on custom data to accurately answer queries based on the provided context. Your primary goal is to assist users by providing relevant information, and you should not attempt to make up answers if the information is not available in the context. Given the following context, please provide the best possible answer to the user's query:`;
const BASE_PROMPT_TEMPLATE = `As a customer support agent, please provide a helpful and professional response to the user's question or issue.`;

const Tool = (props: {
  id: string;
  title: string;
  description: string;
  type: ToolType;
  children?: React.ReactNode;
}) => {
  return (
    <Sheet variant="outlined" sx={{ borderRadius: 10, p: 2, width: '100%' }}>
      <Stack direction={'row'} alignItems={'start'} gap={2}>
        {props.children}

        <Stack direction={'column'} spacing={0} width={'100%'}>
          <Stack direction="row" spacing={2} justifyContent={'space-between'}>
            <Stack sx={{ minWidth: 0 }}>
              <Link href={`${RouteNames.DATASTORES}/${props.id}`}>
                <Typography level="body1">{props.title}</Typography>
              </Link>
            </Stack>
            <Stack ml="auto">
              <Chip variant="soft" size="sm">
                {props.type}
              </Chip>
            </Stack>
          </Stack>
          <Typography className="truncate" level="body2">
            {props.description}
          </Typography>
        </Stack>
      </Stack>
    </Sheet>
  );
};

export default function BaseForm(props: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const methods = useForm<UpsertAgentSchema>({
    resolver: zodResolver(UpsertAgentSchema),
    defaultValues: {
      prompt: BASE_PROMPT_TEMPLATE,
      ...props?.defaultValues,
    },
  });

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, defaultValues, isDirty, dirtyFields },
  } = methods;

  const getDatastoresQuery = useSWR<
    Prisma.PromiseReturnType<typeof getDatastores>
  >('/api/datastores', fetcher);

  const onSubmit = async (values: UpsertAgentSchema) => {
    try {
      setIsLoading(true);
      console.log('values', values);
      const { data } = await axios.post('/api/agents', values);
      props?.onSubmitSucces?.(data as Agent);
    } catch (err) {
      console.log('error', err);
    } finally {
      setIsLoading(false);
    }
  };

  const networkError = getDatastoresQuery.error?.message;

  const visiblity = methods.watch('visibility');
  const tools = methods.watch('tools') || [];

  console.log('validation errors', methods.formState.errors);

  return (
    <FormProvider {...methods}>
      <form
        className="flex flex-col w-full space-y-6"
        onSubmit={handleSubmit(onSubmit)}
      >
        {networkError && <Alert color="danger">{networkError}</Alert>}

        <Input
          label="Name (optional)"
          control={control as any}
          {...register('name')}
        />

        <FormControl>
          <Input
            label="Description"
            control={control as any}
            {...register('description')}
          />
          <Typography level="body3" mt={1}>
            {'Describe what your agent can do.'}
          </Typography>
        </FormControl>

        <div className="flex flex-row">
          <FormControl className="flex flex-row space-x-4">
            <Checkbox
              // {...register('visibility')}
              // defaultChecked={visiblity === AgentVisibility.public}
              checked={visiblity === AgentVisibility.public}
              onChange={(e) => {
                if (e.target.checked) {
                  methods.setValue('visibility', AgentVisibility.public);
                } else {
                  methods.setValue('visibility', AgentVisibility.private);
                }
              }}
            />
            <div className="flex flex-col">
              <FormLabel>Public</FormLabel>
              <Typography level="body3">
                When activated, your agent will be available without an API Key.
              </Typography>
            </div>
          </FormControl>
        </div>

        <FormControl>
          <FormLabel>Prompt</FormLabel>
          <Textarea maxRows={21} minRows={4} {...register('prompt')} />
        </FormControl>

        <FormControl>
          <FormLabel>
            Datastore
            {/* <Typography
              startDecorator={<StorageRoundedIcon fontSize="small" />}
            >
              
            </Typography> */}
          </FormLabel>
          {/* <FormLabel>Tools</FormLabel> */}
          <Typography level="body2" mb={2}>
            {/* Datastores or external integrations your Agent can access */}
            The Datastore your Agent can access
          </Typography>

          {tools.length === 0 && (
            <Alert
              startDecorator={<WarningAmberRoundedIcon />}
              size="sm"
              color="warning"
              variant="soft"
              sx={{ mb: 2 }}
            >
              Agent has access to zero tool
            </Alert>
          )}

          <Select
            defaultValue={tools[0]?.id}
            placeholder="Choose a Datastore"
            onChange={(_, value) => {
              const datastore = getDatastoresQuery?.data?.find(
                (one) => one.id === value
              );

              if (datastore) {
                methods.setValue('tools', [
                  {
                    id: datastore.id,
                    type: ToolType.datastore,
                  },
                ]);
              }

              // const isAgent = getAgentsQuery?.data?.find(
              //   (one) => one.id === value
              // );
              // setState({
              //   currentChatInstance: {
              //     id: value as string,
              //     type: isAgent ? 'agent' : 'datastore',
              //   },
              // });
            }}
          >
            {/* <Typography level="body2" sx={{ pl: 1 }}>
              Agents:
            </Typography> */}
            {getDatastoresQuery.data?.map((datastore) => (
              <Option key={datastore.id} value={datastore.id}>
                {datastore.name}
              </Option>
            ))}
            {/* <Divider sx={{ my: 2 }}></Divider>
            <Typography level="body2" sx={{ pl: 1 }}>
              Datastores:
            </Typography>
            {getDatastoresQuery?.data?.map((datastore) => (
              <Option key={datastore.id} value={datastore.id}>
                {datastore.name}
              </Option>
            ))} */}
          </Select>

          <Stack direction={'row'} gap={1}>
            <Link
              href={`${RouteNames.DATASTORES}/${tools?.[0]?.id}`}
              style={{ marginLeft: 'auto' }}
            >
              <Button
                sx={{ ml: 'auto', mt: 2 }}
                variant="plain"
                endDecorator={<ArrowForwardRoundedIcon />}
                size="sm"
              >
                Go to Datastore
              </Button>
            </Link>
          </Stack>

          {/* <Stack direction={'row'} gap={1} flexWrap={'wrap'}>
            {tools.map((tool) => (
              <Tool
                key={`selected-${tool.id}`}
                id={tool.id}
                title={tool.name!}
                description={tool.description!}
                type={tool.type}
              >
                <IconButton
                  variant="plain"
                  color="danger"
                  size="sm"
                  onClick={() => {
                    methods.setValue(
                      'tools',
                      tools.filter((each) => each.id !== tool.id)
                    );
                  }}
                >
                  <RemoveCircleOutlineRoundedIcon />
                </IconButton>
              </Tool>
            ))}
          </Stack>
          <Divider sx={{ my: 2 }} />
          <Stack direction={'row'} gap={1} flexWrap={'wrap'}>
            {getDatastoresQuery.data
              ?.filter((each) => !tools.find((one) => one.id === each.id))
              .map((datastore) => (
                <Tool
                  key={datastore.id}
                  id={datastore.id}
                  title={datastore.name}
                  description={datastore.description}
                  type={ToolType.datastore}
                >
                  <IconButton
                    size="sm"
                    variant="plain"
                    color="success"
                    onClick={() => {
                      methods.setValue('tools', [
                        ...tools,
                        {
                          id: datastore.id,
                          type: ToolType.datastore,
                          name: datastore.name,
                          description: datastore.description,
                        },
                      ]);
                    }}
                  >
                    <AddCircleOutlineRoundedIcon />
                  </IconButton>
                </Tool>
              ))}

            <Tool
              title={'Google Agenda'}
              description={'Give access to your Google Agenda'}
              type={ToolType.connector}
            >
              <IconButton
                size="sm"
                variant="plain"
                color="success"
                onClick={() => {
                  signIn('google', {
                    callbackUrl: `/agents`,
                  });
                }}
                // onClick={() => {
                //   methods.setValue('tools', [
                //     ...tools,
                //     {
                //       id: datastore.id,
                //       type: ToolType.datastore,
                //       name: datastore.name,
                //       description: datastore.description,
                //     },
                //   ]);
                // }}
              >
                <AddCircleOutlineRoundedIcon />
              </IconButton>
            </Tool>
          </Stack> */}
        </FormControl>

        {/* <Divider /> */}

        <Button
          type="submit"
          variant="solid"
          color="primary"
          loading={isLoading}
          sx={{ ml: 'auto', mt: 2 }}
          // disabled={!methods.formState.isValid}
          startDecorator={<SaveRoundedIcon />}
        >
          {'Submit'}
        </Button>
      </form>

      {/* <Button
        onClick={() => {
          axios.post('/api/google-test');
        }}
      >
        test
      </Button> */}
    </FormProvider>
  );
}
