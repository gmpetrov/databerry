import { zodResolver } from '@hookform/resolvers/zod';
import AddIcon from '@mui/icons-material/Add';
import AddCircleOutlineRoundedIcon from '@mui/icons-material/AddCircleOutlineRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import ConstructionOutlined from '@mui/icons-material/ConstructionOutlined';
import DeleteIcon from '@mui/icons-material/Delete';
import RemoveCircleOutlineRoundedIcon from '@mui/icons-material/RemoveCircleOutlineRounded';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import StorageRoundedIcon from '@mui/icons-material/StorageRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import { AvatarGroup } from '@mui/joy';
import Alert from '@mui/joy/Alert';
import Avatar from '@mui/joy/Avatar';
import Box from '@mui/joy/Box';
import Button from '@mui/joy/Button';
import Card from '@mui/joy/Card';
import Checkbox from '@mui/joy/Checkbox';
import Chip from '@mui/joy/Chip';
import Divider from '@mui/joy/Divider';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import IconButton from '@mui/joy/IconButton';
import Modal from '@mui/joy/Modal';
import Option from '@mui/joy/Option';
import Select from '@mui/joy/Select';
import Sheet from '@mui/joy/Sheet';
import Slider from '@mui/joy/Slider';
import Stack from '@mui/joy/Stack';
import Textarea from '@mui/joy/Textarea';
import Typography from '@mui/joy/Typography';
import {
  Agent,
  AgentVisibility,
  AppDatasource as Datasource,
  DatasourceType,
  Prisma,
  PromptType,
  ToolType,
} from '@prisma/client';
import axios from 'axios';
import mime from 'mime-types';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import React, { useEffect, useRef, useState } from 'react';
import { FormProvider, useForm, useFormContext } from 'react-hook-form';
import toast from 'react-hot-toast';
import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import { z } from 'zod';

import Input from '@app/components/Input';
import useStateReducer from '@app/hooks/useStateReducer';
import { getAgents, upsertAgent } from '@app/pages/api/agents';
import { createDatastore, getDatastores } from '@app/pages/api/datastores';
import { RouteNames } from '@app/types';
import { GenerateUploadLinkRequest, UpsertAgentSchema } from '@app/types/dtos';
import cuid from '@app/utils/cuid';
import getDatastoreS3Url from '@app/utils/get-datastore-s3-url';
import getS3RootDomain from '@app/utils/get-s3-root-domain';
import { CUSTOMER_SUPPORT } from '@app/utils/prompt-templates';
import { fetcher, postFetcher } from '@app/utils/swr-fetcher';

const CreateDatastoreModal = dynamic(
  () => import('@app/components/CreateDatastoreModal'),
  {
    ssr: false,
  }
);

type Props = {
  defaultValues?: UpsertAgentSchema;
  onSubmitSucces?: (agent: Agent) => any;
};

// const BASE_PROMPT_TEMPLATE = `Imagine you are an AI customer support assistant, specifically trained on custom data to accurately answer queries based on the provided context. Your primary goal is to assist users by providing relevant information, and you should not attempt to make up answers if the information is not available in the context. Given the following context, please provide the best possible answer to the user's query:`;

const PROMPT_TEMPLATES = [
  {
    type: PromptType.customer_support,
    label: 'Customer Support',
    image: '',
    description:
      'Default customer support agent template. Customer Support templates are wrapped in another prompt optimized for Q&A of documents.',
    prompt: CUSTOMER_SUPPORT,
  },
  {
    type: PromptType.raw,
    label: 'Raw',
    image: '',
    description: `You have complete control over the prompt.\nUse variable {query} to reference user's query.\nUse variable {context} to reference the retrieved context.`,
    prompt:
      'Answer the following question based on the provided context: {context} question: {query}',
  },
];
const PROMPT_TEMPLATES_FUN = [
  {
    type: PromptType.customer_support,
    label: 'Shakespeare',
    image:
      'https://actintheatre.com/wp-content/uploads/2019/01/Shakespeare-300x278.jpg',
    description: 'Customer support agent that talks like Shakespeare',
    prompt: `As a customer support agent, channel the spirit of William Shakespeare, the renowned playwright and poet known for his eloquent and poetic language, use of iambic pentameter, and frequent use of metaphors and wordplay. Respond to the user's question or issue in the style of the Bard himself.`,
  },
  {
    type: PromptType.customer_support,
    label: 'Arnold Schwarzenegger',
    image: 'https://i.redd.it/ni0if4asnrd71.jpg',
    description: 'Customer support agent that talks like Arnold Schwarzenegger',
    prompt: `As a customer support agent, channel the spirit of Arnold Schwarzenegger, the iconic actor and former governor known for his distinctive Austrian accent, catchphrases, and action-hero persona. Respond to the user's question or issue in the style of Arnold himself.`,
  },
];

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
  const defaultIconUrl = '/.well-known/logo.png';
  const [isCreateDatastoreModalOpen, setIsCreateDatastoreModalOpen] =
    useState(false);
  const fileInputRef = useRef();

  const [state, setState] = useStateReducer({
    isLoading: false,
    isUploadingAgentIcon: false,
    isUpdatingPlugin: false,
    iconUrl: props?.defaultValues?.iconUrl || defaultIconUrl,
  });

  const upsertAgentMutation = useSWRMutation<
    Prisma.PromiseReturnType<typeof upsertAgent>
  >(`/api/agents`, postFetcher);

  const [isPromptTemplatesModalOpen, setIsPromptTemplatesModalOpen] =
    useState(false);
  const methods = useForm<UpsertAgentSchema>({
    resolver: zodResolver(UpsertAgentSchema),
    defaultValues: {
      prompt: CUSTOMER_SUPPORT,
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

  const handleUploadAgentIcon = async (event: any) => {
    try {
      setState({ isUploadingAgentIcon: true });
      const file = event.target.files[0];
      const fileName = `agent-icon.${mime.extension(file.type)}`;

      // upload text from file to AWS
      const uploadLinkRes = await axios.post(
        `/api/agents/${defaultValues?.id}/generate-upload-link`,
        {
          fileName,
          type: file.type,
        } as GenerateUploadLinkRequest
      );

      await axios.put(uploadLinkRes.data, file, {
        headers: {
          'Content-Type': file.type,
        },
      });

      const getAgentStoreS3Url = (agentId: string) => {
        return `${getS3RootDomain()}/agents/${agentId}`;
      };

      const iconUrl = `${getS3RootDomain()}/agents/${
        defaultValues?.id
      }/${fileName}`;

      setState({
        iconUrl: iconUrl,
      });

      await upsertAgentMutation.trigger({
        ...defaultValues,
        iconUrl,
      } as any);

      toast.success('Agent icon updated successfully!');
      setState({ isUploadingAgentIcon: false });
    } catch (err) {
      console.log(err, err);
    } finally {
    }
  };

  const handleDeleteAgentIcon = async () => {
    try {
      setState({ isUploadingAgentIcon: true });

      await upsertAgentMutation.trigger({
        ...defaultValues,
        iconUrl: null,
      } as any);
      setState({ iconUrl: defaultIconUrl });
    } catch (err) {
    } finally {
      setState({ isUploadingAgentIcon: false });
    }
  };

  const onSubmit = async (values: UpsertAgentSchema) => {
    try {
      setState({ isLoading: true });
      console.log('values', values);
      const { data } = await toast.promise(axios.post('/api/agents', values), {
        loading: 'Updating...',
        success: 'Updated!',
        error: 'Something went wrong',
      });
      props?.onSubmitSucces?.(data as Agent);
    } catch (err) {
      console.log('error', err);
    } finally {
      setState({ isLoading: false });
    }
  };

  const networkError = getDatastoresQuery.error?.message;

  const visiblity = methods.watch('visibility');
  const tools = methods.watch('tools') || [];
  const prompt = methods.watch('prompt');

  // Is this log usefull ?
  // console.log('validation errors', methods.formState.errors);

  return (
    <FormProvider {...methods}>
      <form
        className="flex flex-col w-full space-y-6"
        onSubmit={handleSubmit(onSubmit)}
      >
        {networkError && <Alert color="danger">{networkError}</Alert>}
        <Stack gap={1}>
          <Typography level="body2">Icon</Typography>
          <input
            type="file"
            hidden
            accept={'image/*'}
            onChange={handleUploadAgentIcon}
            ref={fileInputRef as any}
          />

          <Stack gap={1}>
            <AvatarGroup>
              <Avatar
                size="lg"
                variant="outlined"
                src={`${state?.iconUrl}?timestamp=${Date.now()}`}
              />
            </AvatarGroup>
            <Stack direction="row" gap={1}>
              <Button
                variant="outlined"
                color="neutral"
                size="sm"
                onClick={() => {
                  (fileInputRef as any).current?.click?.();
                }}
                startDecorator={<AutorenewIcon />}
                loading={state.isUploadingAgentIcon}
              >
                Replace
              </Button>
              {state?.iconUrl && state?.iconUrl !== defaultIconUrl && (
                <Button
                  variant="outlined"
                  color="danger"
                  onClick={handleDeleteAgentIcon}
                  size="sm"
                  startDecorator={<DeleteIcon />}
                >
                  Delete
                </Button>
              )}
              {/* {defaultValues?.pluginIconUrl && (
                <Button
                  variant="outlined"
                  color="danger"
                  onClick={handleDeleteAgentIcon}
                  size="sm"
                  startDecorator={<DeleteIcon />}
                >
                  Delete
                </Button>
              )} */}
            </Stack>
          </Stack>
        </Stack>
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
          <FormLabel>Model</FormLabel>

          <Select defaultValue={'gpt-3.5-turbo'}>
            <Option value="gpt-3.5-turbo">OpenAI gpt-3.5-turbo</Option>
          </Select>
        </FormControl>

        <FormControl>
          <FormLabel>Model Temperature</FormLabel>

          <Alert color="info">
            Temperature is a parameter of the model that governs the randomness
            and thus the creativity of the responses. A temperature of 0 means
            the responses will be very straightforward, almost deterministic
            (meaning you almost always get the same response to a given prompt)
            A temperature of 1 means the responses can vary wildly.
          </Alert>

          <Slider
            // {...register('temperature')}
            defaultValue={defaultValues?.temperature || 0.0}
            onChange={(_, value) => {
              methods.setValue('temperature', value as number);
            }}
            marks={[
              { value: 0.0, label: 0 },
              { value: 0.1, label: 0.1 },
              { value: 0.2, label: 0.2 },
              { value: 0.3, label: 0.3 },
              { value: 0.4, label: 0.4 },
              { value: 0.5, label: 0.5 },
              { value: 0.6, label: 0.6 },
              { value: 0.7, label: 0.7 },
              { value: 0.8, label: 0.8 },
              { value: 0.9, label: 0.9 },
              { value: 1.0, label: 1 },
            ]}
            valueLabelDisplay="on"
            step={0.01}
            min={0}
            max={1}
          />
        </FormControl>

        <FormControl>
          <FormLabel>Prompt</FormLabel>
          <Textarea
            value={prompt || ''}
            maxRows={21}
            minRows={4}
            {...register('prompt')}
          />
          <Button
            variant="plain"
            endDecorator={<ArrowForwardRoundedIcon />}
            sx={{ mt: 1, ml: 'auto' }}
            onClick={() => setIsPromptTemplatesModalOpen(true)}
          >
            Choose a Prompt Template
          </Button>
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
            The Datastore your Agent can access.
          </Typography>

          {tools.length === 0 && (
            <Alert
              startDecorator={<WarningAmberRoundedIcon />}
              size="sm"
              color="warning"
              variant="soft"
              sx={{ mb: 2 }}
            >
              Agent does not have access to custom data
            </Alert>
          )}

          <Select
            value={tools[0]?.id}
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

          {!tools[0]?.id && (
            <Stack direction={'column'} gap={1}>
              <Button
                sx={{ mr: 'auto', mt: 2 }}
                variant="plain"
                // endDecorator={<ArrowForwardRoundedIcon />}
                startDecorator={<AddIcon />}
                size="sm"
                onClick={() => setIsCreateDatastoreModalOpen(true)}
              >
                Create a Datastore
              </Button>
            </Stack>
          )}

          {tools[0]?.id && (
            <Stack direction={'row'} gap={1}>
              <Link
                href={`${RouteNames.DATASTORES}/${tools?.[0]?.id}`}
                style={{ marginLeft: 'auto' }}
              >
                <Button
                  sx={{ mt: 2 }}
                  variant="plain"
                  endDecorator={<ArrowForwardRoundedIcon />}
                  size="sm"
                >
                  Go to Datastore
                </Button>
              </Link>
            </Stack>
          )}

          <CreateDatastoreModal
            isOpen={isCreateDatastoreModalOpen}
            onSubmitSuccess={(newDatatore) => {
              getDatastoresQuery.mutate();
              setIsCreateDatastoreModalOpen(false);

              methods.setValue('tools', [
                {
                  id: newDatatore.id!,
                  type: ToolType.datastore,
                },
              ]);
            }}
            handleClose={() => {
              setIsCreateDatastoreModalOpen(false);
            }}
          />
          {/* )} */}

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
          loading={state.isLoading}
          sx={{ ml: 'auto', mt: 2 }}
          // disabled={!methods.formState.isValid}
          // startDecorator={<SaveRoundedIcon />}
        >
          {'Save'}
        </Button>
      </form>

      {/* <Button
        onClick={() => {
          axios.post('/api/google-test');
        }}
      >
        test
      </Button> */}

      <Modal
        open={isPromptTemplatesModalOpen}
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          py: 2,
        }}
        onClose={() => {
          setIsPromptTemplatesModalOpen(false);
        }}
      >
        <Card
          variant="outlined"
          sx={{
            width: '100%',
            maxWidth: 500,
            maxHeight: '100%',
            overflowY: 'auto',
          }}
        >
          <Typography level="h6">Prompt Templates</Typography>
          <Typography level="body2">Tailored to your business needs</Typography>

          <Divider sx={{ my: 2 }}></Divider>
          <Stack gap={1} direction="column">
            {PROMPT_TEMPLATES.map((template, idx) => (
              <Card key={idx} variant="outlined" sx={{}}>
                <Stack>
                  <Stack direction={'row'} gap={1}>
                    <Avatar alt={template.image} src={template.image} />
                    <Stack gap={2}>
                      <Stack gap={1}>
                        <Typography>{template.label}</Typography>
                        <Chip size="sm" sx={{ mr: 'auto' }} variant="outlined">
                          {template.type}
                        </Chip>
                      </Stack>
                      <Typography level="body2">
                        {template.description}
                      </Typography>
                    </Stack>
                  </Stack>

                  <Button
                    size="sm"
                    variant="plain"
                    endDecorator={<ArrowForwardRoundedIcon />}
                    sx={{ ml: 'auto', mt: 2 }}
                    onClick={() => {
                      methods.setValue('prompt', template.prompt);
                      methods.setValue('promptType', template.type);
                      setIsPromptTemplatesModalOpen(false);
                    }}
                  >
                    Use Template
                  </Button>
                </Stack>
              </Card>
            ))}
          </Stack>
          <Divider sx={{ my: 4 }}></Divider>

          <Typography sx={{ mx: 'auto', mb: 2 }} color="primary">
            Just for fun 🎉
          </Typography>
          <Stack gap={1}>
            {PROMPT_TEMPLATES_FUN.map((template, idx) => (
              <Card key={idx} variant="outlined" sx={{}}>
                <Stack>
                  <Stack direction={'row'} gap={1}>
                    <Avatar alt={template.image} src={template.image} />
                    <Stack gap={2}>
                      <Stack gap={1}>
                        <Typography>{template.label}</Typography>
                        <Chip size="sm" sx={{ mr: 'auto' }} variant="outlined">
                          {template.type}
                        </Chip>
                      </Stack>
                      <Typography level="body2">
                        {template.description}
                      </Typography>
                    </Stack>
                  </Stack>

                  <Button
                    size="sm"
                    variant="plain"
                    endDecorator={<ArrowForwardRoundedIcon />}
                    sx={{ ml: 'auto', mt: 2 }}
                    onClick={() => {
                      methods.setValue('prompt', template.prompt);
                      methods.setValue('promptType', template.type);
                      setIsPromptTemplatesModalOpen(false);
                    }}
                  >
                    Use Template
                  </Button>
                </Stack>
              </Card>
            ))}
          </Stack>
        </Card>
      </Modal>
    </FormProvider>
  );
}
