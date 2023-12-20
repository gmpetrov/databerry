import AddIcon from '@mui/icons-material/Add';
import AddCircleOutlineRoundedIcon from '@mui/icons-material/AddCircleOutlineRounded';
import RemoveCircleOutlineRoundedIcon from '@mui/icons-material/RemoveCircleOutlineRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import Alert from '@mui/joy/Alert';
import Button from '@mui/joy/Button';
import Card from '@mui/joy/Card';
import Chip from '@mui/joy/Chip';
import Divider from '@mui/joy/Divider';
import IconButton from '@mui/joy/IconButton';
import Option from '@mui/joy/Option';
import Select from '@mui/joy/Select';
import Stack from '@mui/joy/Stack';
import Typography from '@mui/joy/Typography';
import cuid from 'cuid';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import React, { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import useSWR from 'swr';

import useModal from '@app/hooks/useModal';
import { getDatastores } from '@app/pages/api/datastores';

import agentToolFormat, {
  createTool,
  NormalizedTool,
} from '@chaindesk/lib/agent-tool-format';
import { fetcher } from '@chaindesk/lib/swr-fetcher';
import { RouteNames } from '@chaindesk/lib/types';
import { CreateAgentSchema, ToolSchema } from '@chaindesk/lib/types/dtos';
import {
  AppDatasource as Datasource,
  Prisma,
  ToolType,
} from '@chaindesk/prisma';

import APIToolForm from '../APIToolForm';
type Props = {};

const CreateDatastoreModal = dynamic(
  () => import('@app/components/CreateDatastoreModal'),
  {
    ssr: false,
  }
);

type ToolCardProps = Partial<NormalizedTool> & {
  children?: React.ReactNode;
  onClick?: any;
  link?: string;
};

const ToolCard = (props: ToolCardProps) => {
  return (
    <Card
      variant="outlined"
      sx={{ borderRadius: 10, width: '100%' }}
      size="sm"
      onClick={props.onClick}
    >
      <Stack direction={'row'} alignItems={'center'} gap={2}>
        {props.children}

        <Stack direction={'column'} spacing={0} width={'100%'}>
          <Stack
            direction="row"
            spacing={2}
            justifyContent={'space-between'}
            alignItems={'center'}
          >
            <Stack sx={{ minWidth: 0 }}>
              {props.link ? (
                <Link href={props.link} className="underline">
                  <Typography level="body-md">{props.name}</Typography>
                </Link>
              ) : (
                <Typography level="body-md">{props.name}</Typography>
              )}
            </Stack>
            {props.type && (
              <Stack ml="auto">
                <Chip variant="soft" size="md" color="primary">
                  {props.type}
                </Chip>
              </Stack>
            )}
          </Stack>
          <Typography className="truncate" level="body-sm">
            {props.description}
          </Typography>
        </Stack>
      </Stack>
    </Card>
  );
};

function ToolsInput({}: Props) {
  const { watch, setValue, register } = useFormContext<CreateAgentSchema>();
  const [isCreateDatastoreModalOpen, setIsCreateDatastoreModalOpen] =
    useState(false);

  const newDatastoreModal = useModal();
  const newApiToolForm = useModal();

  const getDatastoresQuery = useSWR<
    Prisma.PromiseReturnType<typeof getDatastores>
  >('/api/datastores', fetcher);

  const tools = watch('tools') || [];

  const formattedTools = tools.map(agentToolFormat);

  return (
    <Stack gap={1}>
      {tools.length === 0 && (
        <Alert
          startDecorator={<WarningAmberRoundedIcon />}
          size="sm"
          color="warning"
          variant="soft"
        >
          Agent does not have access to custom data
        </Alert>
      )}

      <Stack direction={'row'} gap={1} flexWrap={'wrap'}>
        {formattedTools.map((tool) => (
          <ToolCard
            key={tool.id}
            id={tool.id}
            type={tool.type}
            name={tool.name!}
            description={tool.description!}
            link={
              tool.type === 'datastore'
                ? `${RouteNames.DATASTORES}/${tool.datastoreId}`
                : undefined
            }
          >
            <IconButton
              variant="plain"
              color="danger"
              size="sm"
              onClick={() => {
                setValue(
                  'tools',
                  tools.filter((each) => each.id !== tool.id),
                  {
                    shouldDirty: true,
                    shouldValidate: true,
                  }
                );
              }}
            >
              <RemoveCircleOutlineRoundedIcon />
            </IconButton>
          </ToolCard>
        ))}
      </Stack>

      <Divider sx={{ my: 2 }} />

      <ToolCard
        id="datastore-tool"
        name={'Datastore'}
        description={'Connect custom data to your Agent'}
      >
        <IconButton
          size="sm"
          variant="plain"
          color="success"
          onClick={() => {
            newDatastoreModal.open();
          }}
        >
          <AddCircleOutlineRoundedIcon />
        </IconButton>
      </ToolCard>

      <ToolCard
        id="http-tool"
        name={'HTTP Tool'}
        description={'Perform an HTTP request from your Agent'}
      >
        <IconButton
          size="sm"
          variant="plain"
          color="success"
          onClick={() => {
            newApiToolForm.open();
          }}
        >
          <AddCircleOutlineRoundedIcon />
        </IconButton>
      </ToolCard>

      <newDatastoreModal.component
        title="Datastore"
        description="Connect a Datastore to your Agent."
        dialogProps={{
          sx: {
            maxWidth: 'sm',
            height: 'auto',
          },
        }}
      >
        <Stack direction="row" width="100%" gap={1}>
          <Select
            sx={{ width: '100%' }}
            // value={tools[0]?.datastoreId || ''}
            placeholder="Choose a Datastore"
            onChange={(_, value) => {
              const datastore = getDatastoresQuery?.data?.find(
                (one) => one.id === value
              );

              if (datastore) {
                setValue(
                  'tools',
                  [
                    ...tools,
                    createTool({
                      type: ToolType.datastore,
                      datastoreId: datastore.id,
                      datastore,
                    }),
                  ],
                  {
                    shouldDirty: true,
                    shouldValidate: true,
                  }
                );

                newDatastoreModal.close();
              }
            }}
          >
            {getDatastoresQuery.data
              ?.filter(
                // Don't show already selected datastores
                (each) =>
                  !tools.find((one) => (one as any).datastoreId === each.id)
              )
              ?.map((datastore) => (
                <Option key={datastore.id} value={datastore.id}>
                  {datastore.name}
                </Option>
              ))}
          </Select>
        </Stack>

        <Stack direction={'row'} gap={1}>
          {/* {tools?.length === 0 && ( */}
          <Button
            sx={{ mr: 'auto' }}
            variant="plain"
            // endDecorator={<ArrowForwardRoundedIcon />}
            startDecorator={<AddIcon />}
            size="sm"
            onClick={() => setIsCreateDatastoreModalOpen(true)}
          >
            Create a Datastore
          </Button>
        </Stack>
      </newDatastoreModal.component>

      <newApiToolForm.component
        title="HTTP Tool"
        description="Let your Agent call an HTTP endpoint."
        dialogProps={{
          sx: {
            maxWidth: 'md',
            height: 'auto',
          },
        }}
      >
        <APIToolForm
          onSubmit={(values) => {
            setValue('tools', [...tools, createTool(values)], {
              shouldDirty: true,
              shouldValidate: true,
            });
            newApiToolForm.close();
          }}
        />
      </newApiToolForm.component>

      <CreateDatastoreModal
        isOpen={isCreateDatastoreModalOpen}
        onSubmitSuccess={(newDatatore) => {
          getDatastoresQuery.mutate();
          setIsCreateDatastoreModalOpen(false);
          newDatastoreModal.close();

          setValue(
            'tools',
            [
              ...tools,
              {
                id: cuid(),
                datastoreId: newDatatore.id!,
                datastore: newDatatore,
                type: ToolType.datastore,
              },
            ],
            {
              shouldDirty: true,
              shouldValidate: true,
            }
          );
        }}
        handleClose={() => {
          setIsCreateDatastoreModalOpen(false);
        }}
      />
    </Stack>
  );
}

export default ToolsInput;
