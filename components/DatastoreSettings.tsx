import AddIcon from '@mui/icons-material/Add';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import DeleteIcon from '@mui/icons-material/Delete';
import HelpOutlineRoundedIcon from '@mui/icons-material/HelpOutlineRounded';
import Alert from '@mui/joy/Alert';
import Box from '@mui/joy/Box';
import Button from '@mui/joy/Button';
import Divider from '@mui/joy/Divider';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import IconButton from '@mui/joy/IconButton';
import Stack from '@mui/joy/Stack';
import Typography from '@mui/joy/Typography';
import { DatastoreVisibility, Prisma } from '@prisma/client';
import axios from 'axios';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React from 'react';
import useSWR from 'swr';

import { DatastoreFormsMap } from '@app/components/DatastoreForms';
import { getDatastore } from '@app/pages/api/datastores/[id]';
import { RouteNames } from '@app/types';
import getRootDomain from '@app/utils/get-root-domain';
import { fetcher } from '@app/utils/swr-fetcher';

type Props = {
  datastoreId: string;
};

function DatastoreSettings(props: Props) {
  const router = useRouter();

  const getDatastoreQuery = useSWR<
    Prisma.PromiseReturnType<typeof getDatastore>
  >(`/api/datastores/${props.datastoreId}`, fetcher);

  const handleDeleteDatastore = async () => {
    if (
      window.confirm(
        'Are you sure you want to delete this datastore? This action is irreversible.'
      )
    ) {
      await axios.delete(`/api/datastores/${getDatastoreQuery?.data?.id}`);

      router.push(RouteNames.DATASTORES);
    }
  };

  const handleCreatApiKey = async () => {
    await axios.post(`/api/datastores/${getDatastoreQuery?.data?.id}/api-keys`);

    getDatastoreQuery.mutate();
  };

  const handleDeleteApiKey = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this api key?')) {
      await axios.delete(
        `/api/datastores/${getDatastoreQuery?.data?.id}/api-keys`,
        {
          data: {
            apiKeyId: id,
          },
        }
      );

      getDatastoreQuery.mutate();
    }
  };

  return (
    <Box
      sx={(theme) => ({
        maxWidth: '100%',
        width: theme.breakpoints.values.md,
        mx: 'auto',
      })}
    >
      {React.createElement(
        DatastoreFormsMap?.[getDatastoreQuery?.data?.type!],
        {
          onSubmitSuccess: () => {
            getDatastoreQuery.mutate();
          },
          defaultValues: {
            ...getDatastoreQuery?.data,
            isPublic:
              getDatastoreQuery?.data?.visibility ===
              DatastoreVisibility.public,
          } as any,
          submitButtonText: 'Update',
          submitButtonProps: {
            // variant: 'contained',
            variant: 'outlined',
            className: 'ml-auto',
          },
        }
      )}

      <Divider sx={{ my: 4 }} />
      <FormControl sx={{ gap: 1 }}>
        <Stack spacing={2}>
          <FormLabel>Datastore ID</FormLabel>

          <Alert
            color="info"
            startDecorator={<HelpOutlineRoundedIcon />}
            endDecorator={
              <Link href="https://docs.databerry.ai" target="_blank">
                <Button
                  variant="plain"
                  size="sm"
                  endDecorator={<ArrowForwardRoundedIcon />}
                >
                  Documentation
                </Button>
              </Link>
            }
          >
            Learn more about the Datatberry API
          </Alert>

          <Alert color="neutral">{getDatastoreQuery?.data?.id}</Alert>
        </Stack>
      </FormControl>
      <Divider sx={{ my: 4 }} />
      <FormControl sx={{ gap: 1 }}>
        <FormLabel>API Keys</FormLabel>
        <Typography level="body3">
          Use the api key to access the datastore from the Databerry API
        </Typography>

        <Stack direction={'column'} gap={2} mt={2}>
          {getDatastoreQuery?.data?.apiKeys?.map((each) => (
            <>
              <Stack key={each.id} direction={'row'} gap={2}>
                <Alert color="neutral" sx={{ width: '100%' }}>
                  {each.key}
                </Alert>

                <IconButton
                  color="danger"
                  variant="outlined"
                  onClick={() => handleDeleteApiKey(each.id)}
                >
                  <DeleteIcon />
                </IconButton>
              </Stack>
            </>
          ))}
        </Stack>

        <Button
          startDecorator={<AddIcon />}
          sx={{ mt: 3, ml: 'auto' }}
          variant="outlined"
          onClick={handleCreatApiKey}
        >
          Create API Key
        </Button>
      </FormControl>

      <Divider sx={{ my: 4 }} />

      <FormControl sx={{ gap: 1 }}>
        <FormLabel>ChatGPT Plugin</FormLabel>
        <Typography level="body3">
          Configuration files for the ChatGPT Plugin are generated automatically
        </Typography>

        <Stack>
          <Stack gap={2} mt={2}>
            <Typography level="body2">ai-plugin.json</Typography>
            <Alert color="neutral" sx={{ width: '100%' }}>
              {`https://${getDatastoreQuery?.data?.id}.${getRootDomain(
                process.env.NEXT_PUBLIC_DASHBOARD_URL!
              )}/.well-known/ai-plugin.json`}
            </Alert>
          </Stack>
          <Stack gap={2} mt={2}>
            <Typography level="body2">openapi.yaml</Typography>
            <Alert color="neutral" sx={{ width: '100%' }}>
              {`https://${getDatastoreQuery?.data?.id}.${getRootDomain(
                process.env.NEXT_PUBLIC_DASHBOARD_URL!
              )}/.well-known/openapi.yaml`}
            </Alert>
          </Stack>
        </Stack>
      </FormControl>

      <Divider sx={{ my: 4 }} />

      <FormControl sx={{ gap: 1 }}>
        <FormLabel>Delete Datastore</FormLabel>
        <Typography level="body3">
          It will delete the datastore and all its datasources
        </Typography>
        <Button
          color="danger"
          sx={{ mr: 'auto', mt: 2 }}
          startDecorator={<DeleteIcon />}
          onClick={handleDeleteDatastore}
        >
          Delete
        </Button>
      </FormControl>
    </Box>
  );
}

export default DatastoreSettings;
