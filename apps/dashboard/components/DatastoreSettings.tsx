import { zodResolver } from '@hookform/resolvers/zod';
import AddIcon from '@mui/icons-material/Add';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import DeleteIcon from '@mui/icons-material/Delete';
import HelpOutlineRoundedIcon from '@mui/icons-material/HelpOutlineRounded';
import Alert from '@mui/joy/Alert';
import Avatar from '@mui/joy/Avatar';
import AvatarGroup from '@mui/joy/AvatarGroup';
import Box from '@mui/joy/Box';
import Button from '@mui/joy/Button';
import Divider from '@mui/joy/Divider';
import FormControl from '@mui/joy/FormControl';
import FormHelperText from '@mui/joy/FormHelperText';
import FormLabel from '@mui/joy/FormLabel';
import IconButton from '@mui/joy/IconButton';
import Stack from '@mui/joy/Stack';
import Textarea from '@mui/joy/Textarea';
import Typography from '@mui/joy/Typography';
import axios from 'axios';
import mime from 'mime-types';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import useSWRMutation from 'swr/mutation';
import { z } from 'zod';

import { DatastoreFormsMap } from '@app/components/DatastoreForms';
import Input from '@app/components/Input';
import useGetDatastoreQuery from '@app/hooks/useGetDatastoreQuery';
import useStateReducer from '@app/hooks/useStateReducer';
import { createDatastore } from '@app/pages/api/datastores';
import { updateDatastore } from '@app/pages/api/datastores/[id]';

import getDatastoreS3Url from '@chaindesk/lib/get-datastore-s3-url';
import getRootDomain from '@chaindesk/lib/get-root-domain';
import { generateActionFetcher, HTTP_METHOD } from '@chaindesk/lib/swr-fetcher';
import { RouteNames } from '@chaindesk/lib/types';
import { GenerateUploadLinkRequest } from '@chaindesk/lib/types/dtos';
import { QdrantSchema as Schema } from '@chaindesk/lib/types/models';
import { Datastore, DatastoreVisibility, Prisma } from '@chaindesk/prisma';

import UsageLimitCard from './UsageLimitCard';
import UserFree from './UserFree';
import UserPremium from './UserPremium';

type Props = {
  datastoreId: string;
};

type Schema = z.infer<typeof Schema>;

function PluginSettings({ datastore }: { datastore: Datastore }) {
  const fileInputRef = useRef();
  const [state, setState] = useStateReducer({
    isUploadingPluginIcon: false,
    isUpdatingPlugin: false,
  });

  const { getDatastoreQuery } = useGetDatastoreQuery({});

  const createDatastoreMutation = useSWRMutation<
    Prisma.PromiseReturnType<typeof createDatastore>
  >(`/api/datastores`, generateActionFetcher(HTTP_METHOD.POST));

  const updateDatastoreMutation = useSWRMutation<
    Prisma.PromiseReturnType<typeof updateDatastore>
  >(
    `/api/datastores/${datastore.id}`,
    generateActionFetcher(HTTP_METHOD.PATCH)
  );

  const methods = useForm<Schema>({
    resolver: zodResolver(Schema),
    defaultValues: {
      ...datastore,
      isPublic: datastore?.visibility === DatastoreVisibility.public,
    } as Schema,
  });

  const handleUploadPluginIcon = async (event: any) => {
    try {
      setState({ isUploadingPluginIcon: true });
      const file = event.target.files[0];

      const fileName = `plugin-icon.${mime.extension(file.type)}`;

      // upload text from file to AWS
      const uploadLinkRes = await axios.post(
        `/api/datastores/${datastore?.id}/generate-upload-link`,
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

      const pluginIconUrl = `${getDatastoreS3Url(datastore?.id!)}/${fileName}`;

      await createDatastoreMutation.trigger({
        ...datastore,
        pluginIconUrl: pluginIconUrl,
      } as any);

      await getDatastoreQuery.mutate();

      toast.success('Plugin icon updated successfully!');
    } catch (err) {
      console.log(err, err);
    } finally {
      setState({ isUploadingPluginIcon: false });
    }
  };

  const handleDeletePluginIcon = async () => {
    try {
      setState({ isUploadingPluginIcon: true });

      await updateDatastoreMutation.trigger({
        ...datastore,
        pluginIconUrl: '',
      } as any);

      await getDatastoreQuery.mutate();
    } catch (err) {
    } finally {
      setState({ isUploadingPluginIcon: false });
    }
  };

  const handleUpdatePlugin = async (values: Schema) => {
    try {
      setState({ isUpdatingPlugin: true });

      await updateDatastoreMutation.trigger({
        ...values,
      } as any);

      await getDatastoreQuery.mutate();

      toast.success('Plugin updated successfully!');
    } catch (err) {
    } finally {
      setState({ isUpdatingPlugin: false });
    }
  };

  return (
    <form onSubmit={methods.handleSubmit(handleUpdatePlugin)}>
      <Stack gap={2}>
        <Stack gap={1}>
          <Typography level="body-sm">Plugin Icon</Typography>

          <input
            type="file"
            hidden
            accept={'image/*'}
            // {...register('config.source_url')}
            // value={datastore?.pluginIconUrl || ''}
            onChange={handleUploadPluginIcon}
            ref={fileInputRef as any}
          />

          <Stack gap={1}>
            <AvatarGroup>
              <Avatar
                size="lg"
                variant="outlined"
                src={`${
                  datastore?.pluginIconUrl || '/.well-known/logo.png'
                }?timestamp=${Date.now()}`}
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
                loading={state.isUploadingPluginIcon}
              >
                Replace
              </Button>
              {datastore?.pluginIconUrl && (
                <Button
                  variant="outlined"
                  color="danger"
                  onClick={handleDeletePluginIcon}
                  size="sm"
                  startDecorator={<DeleteIcon />}
                >
                  Delete
                </Button>
              )}
            </Stack>
          </Stack>
        </Stack>

        <FormControl>
          <FormLabel>Name for humans (required, 20 character max)</FormLabel>
          <Input
            control={methods.control as any}
            placeholder="e.g. Chaindesk"
            {...methods.register('pluginName')}
          />
        </FormControl>
        <FormControl>
          <FormLabel>
            Description for humans (required, 100 character max)
          </FormLabel>
          <Input
            control={methods.control as any}
            placeholder="e.g. Chaindesk is a no-code platform for building AI apps..."
            {...methods.register('pluginDescriptionForHumans')}
          />
        </FormControl>
        <FormControl>
          <FormLabel>
            Description for model (required, 8,000 character max)
          </FormLabel>
          <Textarea
            // value={prompt || ''}
            maxRows={21}
            minRows={4}
            placeholder={`Plugin for searching informations about ${datastore?.name} to find answers to questions and retrieve relevant information. Use it whenever a user asks something that might be related to ${datastore?.name}.`}
            {...methods.register('pluginDescriptionForModel')}
          />
          <FormHelperText>
            <Link
              target="_blank"
              href="https://platform.openai.com/docs/plugins/getting-started/writing-descriptions"
            >
              <Button
                variant="plain"
                endDecorator={<ArrowForwardRoundedIcon />}
              >
                Plugin description best practices
              </Button>
            </Link>
          </FormHelperText>
        </FormControl>

        <Button
          variant="outlined"
          sx={{ ml: 'auto' }}
          loading={state.isUpdatingPlugin}
          type="submit"
        >
          Update
        </Button>

        <Stack gap={1}>
          <Typography level="body-sm">Plugin Root</Typography>

          <Alert
            color="neutral"
            sx={{
              width: '100%',
              cursor: 'copy',
            }}
            onClick={() => {
              navigator.clipboard.writeText(
                `https://${datastore?.id}.${getRootDomain(
                  process.env.NEXT_PUBLIC_DASHBOARD_URL!
                )}`
              );
              toast.success('Copied!', {
                position: 'bottom-center',
              });
            }}
          >
            {`https://${datastore?.id}.${getRootDomain(
              process.env.NEXT_PUBLIC_DASHBOARD_URL!
            )}`}
          </Alert>
        </Stack>
        <Stack gap={2}>
          <Typography level="body-sm">ai-plugin.json</Typography>
          <Alert
            color="neutral"
            sx={{
              width: '100%',
              cursor: 'copy',
            }}
            onClick={() => {
              navigator.clipboard.writeText(
                `https://${datastore?.id}.${getRootDomain(
                  process.env.NEXT_PUBLIC_DASHBOARD_URL!
                )}/.well-known/ai-plugin.json`
              );
              toast.success('Copied!', {
                position: 'bottom-center',
              });
            }}
          >
            {`https://${datastore?.id}.${getRootDomain(
              process.env.NEXT_PUBLIC_DASHBOARD_URL!
            )}/.well-known/ai-plugin.json`}
          </Alert>
        </Stack>
        <Stack gap={2}>
          <Typography level="body-sm">openapi.yaml</Typography>
          <Alert
            color="neutral"
            sx={{
              width: '100%',
              cursor: 'copy',
            }}
            onClick={() => {
              navigator.clipboard.writeText(
                `https://${datastore?.id}.${getRootDomain(
                  process.env.NEXT_PUBLIC_DASHBOARD_URL!
                )}/.well-known/openapi.yaml`
              );
              toast.success('Copied!', {
                position: 'bottom-center',
              });
            }}
          >
            {`https://${datastore?.id}.${getRootDomain(
              process.env.NEXT_PUBLIC_DASHBOARD_URL!
            )}/.well-known/openapi.yaml`}
          </Alert>
        </Stack>
      </Stack>
    </form>
  );
}

function DatastoreSettings() {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = React.useState(false);

  const { getDatastoreQuery } = useGetDatastoreQuery({});

  const handleDeleteDatastore = async () => {
    if (
      window.confirm(
        'Are you sure you want to delete this datastore? This action is irreversible.'
      )
    ) {
      try {
        setIsDeleting(true);

        await axios.delete(`/api/datastores/${getDatastoreQuery?.data?.id}`);

        router.push(RouteNames.DATASTORES);
      } catch (err) {
        console.log(err);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  if (!getDatastoreQuery?.data?.id) {
    return null;
  }

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
            color="neutral"
            startDecorator={<HelpOutlineRoundedIcon />}
            endDecorator={
              <Link href="https://docs.chaindesk.ai" target="_blank">
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

          <Alert
            color="neutral"
            sx={{
              cursor: 'copy',
            }}
            onClick={() => {
              navigator.clipboard.writeText(getDatastoreQuery?.data?.id!);
              toast.success('Copied!', {
                position: 'bottom-center',
              });
            }}
          >
            {getDatastoreQuery?.data?.id}
          </Alert>
        </Stack>
      </FormControl>

      <Divider sx={{ my: 4 }} />

      <Box id="chatgpt-plugin">
        {getDatastoreQuery?.data?.id && (
          <FormControl sx={{ gap: 1 }}>
            <FormLabel>ChatGPT Plugin</FormLabel>

            <Alert
              color="neutral"
              startDecorator={<HelpOutlineRoundedIcon />}
              endDecorator={
                <Link
                  href="https://docs.chaindesk.ai/integrations/chatgpt-plugin"
                  target="_blank"
                >
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
              Learn more about the ChatGPT plugin installation
            </Alert>

            <UserFree>
              <Alert color="warning">
                <a href="https://openai.com/waitlist/plugins" target="blank">
                  ChatGPT developer access is required:{' '}
                  <span className="underline">join the waitlist</span>
                </a>
              </Alert>

              <UsageLimitCard
                title="Premium Feature"
                description="Upgrade your plan to access this feature"
              />
            </UserFree>
            <UserPremium>
              {getDatastoreQuery?.data && (
                <PluginSettings datastore={getDatastoreQuery?.data} />
              )}
            </UserPremium>
          </FormControl>
        )}
      </Box>

      <Divider sx={{ my: 4 }} />

      <FormControl sx={{ gap: 1 }}>
        <FormLabel>Delete Datastore</FormLabel>
        <Typography level="body-xs">
          It will delete the datastore and all its datasources
        </Typography>
        <Button
          color="danger"
          sx={{ mr: 'auto', mt: 2 }}
          startDecorator={<DeleteIcon />}
          onClick={handleDeleteDatastore}
          loading={isDeleting}
        >
          Delete
        </Button>
      </FormControl>
    </Box>
  );
}

export default DatastoreSettings;
