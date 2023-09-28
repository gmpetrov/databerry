import AddIcon from '@mui/icons-material/Add';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import Alert from '@mui/joy/Alert';
import Button from '@mui/joy/Button';
import Checkbox from '@mui/joy/Checkbox';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import IconButton from '@mui/joy/IconButton';
import Option from '@mui/joy/Option';
import Select from '@mui/joy/Select';
import Stack from '@mui/joy/Stack';
import Typography from '@mui/joy/Typography';
import { AppDatasource as Datasource, Prisma, ToolType } from '@prisma/client';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import React, { useEffect, useRef, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import useSWR from 'swr';

import { getDatastores } from '@app/pages/api/datastores';
import { RouteNames } from '@app/types';
import { CreateAgentSchema } from '@app/types/dtos';
import { fetcher } from '@app/utils/swr-fetcher';
type Props = {};

const CreateDatastoreModal = dynamic(
  () => import('@app/components/CreateDatastoreModal'),
  {
    ssr: false,
  }
);

function ToolsInput({}: Props) {
  const { watch, setValue, register } = useFormContext<CreateAgentSchema>();
  const [isCreateDatastoreModalOpen, setIsCreateDatastoreModalOpen] = useState(
    false
  );

  const getDatastoresQuery = useSWR<
    Prisma.PromiseReturnType<typeof getDatastores>
  >('/api/datastores', fetcher);

  const tools = watch('tools') || [];
  const includeSources = watch('includeSources');

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

      <Stack direction="row" width="100%" gap={1}>
        {tools?.length > 0 && (
          <IconButton
            color="neutral"
            variant="outlined"
            onClick={(e) => {
              setValue('tools', [], {
                shouldDirty: true,
                shouldValidate: true,
              });
            }}
          >
            <DeleteRoundedIcon />
          </IconButton>
        )}

        <Select
          sx={{ width: '100%' }}
          value={tools[0]?.datastoreId || ''}
          placeholder="Choose a Datastore"
          onChange={(_, value) => {
            const datastore = getDatastoresQuery?.data?.find(
              (one) => one.id === value
            );

            if (datastore) {
              setValue(
                'tools',
                [
                  {
                    datastoreId: datastore.id,
                    type: ToolType.datastore,
                  },
                ],
                {
                  shouldDirty: true,
                  shouldValidate: true,
                }
              );
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
          {/* <Typography level="body-sm" sx={{ pl: 1 }}>
              Agents:
            </Typography> */}
          {getDatastoresQuery.data?.map((datastore) => (
            <Option key={datastore.id} value={datastore.id}>
              {datastore.name}
            </Option>
          ))}
          {/* <Divider sx={{ my: 2 }}></Divider>
            <Typography level="body-sm" sx={{ pl: 1 }}>
              Datastores:
            </Typography>
            {getDatastoresQuery?.data?.map((datastore) => (
              <Option key={datastore.id} value={datastore.id}>
                {datastore.name}
                </Option>
              ))} */}
        </Select>
      </Stack>

      <Stack direction={'row'} gap={1}>
        {tools?.length === 0 && (
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
        )}

        {tools?.[0]?.datastoreId && (
          <Link
            href={`${RouteNames.DATASTORES}/${tools?.[0]?.datastoreId}`}
            style={{ marginLeft: 'auto' }}
          >
            <Button
              variant="plain"
              endDecorator={<ArrowForwardRoundedIcon />}
              size="sm"
            >
              Go to Datastore
            </Button>
          </Link>
        )}
      </Stack>

      {tools[0]?.datastoreId && <Stack direction={'row'} gap={1}></Stack>}

      {tools[0]?.datastoreId && (
        <Stack direction="row" mb={2}>
          <FormControl className="flex flex-row space-x-4">
            <Checkbox
              {...register('includeSources')}
              checked={!!includeSources}
            />
            <div className="flex flex-col">
              <FormLabel>Include sources in Agent Answer</FormLabel>
              <Typography level="body-xs">
                When activated, your agent will include sources used to generate
                the answer.
              </Typography>
            </div>
          </FormControl>
        </Stack>
      )}

      <CreateDatastoreModal
        isOpen={isCreateDatastoreModalOpen}
        onSubmitSuccess={(newDatatore) => {
          getDatastoresQuery.mutate();
          setIsCreateDatastoreModalOpen(false);

          setValue(
            'tools',
            [
              {
                datastoreId: newDatatore.id!,
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
