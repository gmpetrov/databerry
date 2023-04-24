import { zodResolver } from '@hookform/resolvers/zod';
import AddIcon from '@mui/icons-material/Add';
import AddCircleOutlineRoundedIcon from '@mui/icons-material/AddCircleOutlineRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import ConstructionOutlined from '@mui/icons-material/ConstructionOutlined';
import RemoveCircleOutlineRoundedIcon from '@mui/icons-material/RemoveCircleOutlineRounded';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import StorageRoundedIcon from '@mui/icons-material/StorageRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
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
import Stack from '@mui/joy/Stack';
import Textarea from '@mui/joy/Textarea';
import Typography from '@mui/joy/Typography';
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
import dynamic from 'next/dynamic';
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
const BASE_PROMPT_TEMPLATE = `As a customer support agent, please provide a helpful and professional response to the user's question or issue.`;

const PROMPT_TEMPLATES = [
  {
    label: 'Customer Support',
    image: '',
    description: 'Default customer support agent template',
    prompt: BASE_PROMPT_TEMPLATE,
  },
];
const PROMPT_TEMPLATES_FUN = [
  {
    label: 'Shakespeare',
    image:
      'https://actintheatre.com/wp-content/uploads/2019/01/Shakespeare-300x278.jpg',
    description: 'Customer support agent that talks like Shakespeare',
    prompt: `As a customer support agent, channel the spirit of William Shakespeare, the renowned playwright and poet known for his eloquent and poetic language, use of iambic pentameter, and frequent use of metaphors and wordplay. Respond to the user's question or issue in the style of the Bard himself.`,
  },
  {
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
  const [isLoading, setIsLoading] = useState(false);
  const [isCreateDatastoreModalOpen, setIsCreateDatastoreModalOpen] =
    useState(false);

  const [isPromptTemplatesModalOpen, setIsPromptTemplatesModalOpen] =
    useState(false);
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
  const prompt = methods.watch('prompt');

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
              setIsCreateDatastoreModalOpen(true);
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
          loading={isLoading}
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
                    <Stack>
                      <Typography>{template.label}</Typography>
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
                    <Stack>
                      <Typography>{template.label}</Typography>
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
