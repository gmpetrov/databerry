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
import FormLabel from '@mui/joy/FormLabel';
import IconButton from '@mui/joy/IconButton';
import Stack from '@mui/joy/Stack';
import Typography from '@mui/joy/Typography';
import { DatastoreVisibility, Prisma } from '@prisma/client';
import axios from 'axios';
import mime from 'mime-types';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useRef } from 'react';
import toast from 'react-hot-toast';
import useSWRMutation from 'swr/mutation';

import { DatastoreFormsMap } from '@app/components/DatastoreForms';
import useGetDatastoreQuery from '@app/hooks/useGetDatastoreQuery';
import useStateReducer from '@app/hooks/useStateReducer';
import { createDatastore } from '@app/pages/api/datastores';
import { GenerateUploadLinkRequest, RouteNames } from '@app/types';
import getDatastoreS3Url from '@app/utils/get-datastore-s3-url';
import getRootDomain from '@app/utils/get-root-domain';
import { postFetcher } from '@app/utils/swr-fetcher';

import UsageLimitCard from './UsageLimitCard';
import UserFree from './UserFree';
import UserPremium from './UserPremium';

type Props = {
  datastoreId: string;
};

function DatastoreSettings() {
  const router = useRouter();
  const fileInputRef = useRef();
  const [state, setState] = useStateReducer({
    isUploadingPluginIcon: false,
  });

  const { getDatastoreQuery } = useGetDatastoreQuery({});

  const upsertDatastoreMutation = useSWRMutation<
    Prisma.PromiseReturnType<typeof createDatastore>
  >(`/api/datastores`, postFetcher);

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

  // const handleCreatApiKey = async () => {
  //   await axios.post(`/api/datastores/${getDatastoreQuery?.data?.id}/api-keys`);

  //   getDatastoreQuery.mutate();
  // };

  // const handleDeleteApiKey = async (id: string) => {
  //   if (window.confirm('Are you sure you want to delete this api key?')) {
  //     await axios.delete(
  //       `/api/datastores/${getDatastoreQuery?.data?.id}/api-keys`,
  //       {
  //         data: {
  //           apiKeyId: id,
  //         },
  //       }
  //     );

  //     getDatastoreQuery.mutate();
  //   }
  // };

  const handleUploadPluginIcon = async (event: any) => {
    try {
      setState({ isUploadingPluginIcon: true });
      const file = event.target.files[0];

      const fileName = `plugin-icon.${mime.extension(file.type)}`;

      // upload text from file to AWS
      const uploadLinkRes = await axios.post(
        `/api/datastores/${getDatastoreQuery?.data?.id}/generate-upload-link`,
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

      const pluginIconUrl = `${getDatastoreS3Url(
        getDatastoreQuery?.data?.id!
      )}/${fileName}`;

      await upsertDatastoreMutation.trigger({
        ...getDatastoreQuery?.data,
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

      await upsertDatastoreMutation.trigger({
        ...getDatastoreQuery?.data,
        pluginIconUrl: '',
      } as any);

      await getDatastoreQuery.mutate();
    } catch (err) {
    } finally {
      setState({ isUploadingPluginIcon: false });
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
      {/* <Divider sx={{ my: 4 }} />
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
      </FormControl> */}

      <Divider sx={{ my: 4 }} />

      <Box id="chatgpt-plugin">
        <FormControl sx={{ gap: 1 }}>
          <FormLabel>ChatGPT Plugin</FormLabel>
          <UserFree>
            <UsageLimitCard
              title="Premium Feature"
              description="Upgrade your plan to access this feature"
            />
          </UserFree>
          <UserPremium>
            <Typography level="body3">
              Configuration files for the ChatGPT Plugin are generated
              automatically
            </Typography>

            <Stack gap={2}>
              <Stack gap={1}>
                <Typography level="body2">Plugin Icon</Typography>

                <input
                  type="file"
                  hidden
                  accept={'image/*'}
                  // {...register('config.source')}
                  // value={getDatastoreQuery?.data?.pluginIconUrl || ''}
                  onChange={handleUploadPluginIcon}
                  ref={fileInputRef as any}
                />

                <Stack gap={1}>
                  <AvatarGroup>
                    <Avatar
                      size="lg"
                      variant="outlined"
                      src={`${
                        getDatastoreQuery?.data?.pluginIconUrl ||
                        '/.well-known/logo.png'
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
                    {getDatastoreQuery?.data?.pluginIconUrl && (
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

              <Stack gap={1}>
                <Typography level="body2">Plugin Root</Typography>

                <Alert
                  color="neutral"
                  sx={{
                    width: '100%',
                    cursor: 'copy',
                  }}
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `https://${getDatastoreQuery?.data?.id}.${getRootDomain(
                        process.env.NEXT_PUBLIC_DASHBOARD_URL!
                      )}`
                    );
                    toast.success('Copied!', {
                      position: 'bottom-center',
                    });
                  }}
                >
                  {`https://${getDatastoreQuery?.data?.id}.${getRootDomain(
                    process.env.NEXT_PUBLIC_DASHBOARD_URL!
                  )}`}
                </Alert>
              </Stack>
              <Stack gap={2}>
                <Typography level="body2">ai-plugin.json</Typography>
                <Alert
                  color="neutral"
                  sx={{
                    width: '100%',
                    cursor: 'copy',
                  }}
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `https://${getDatastoreQuery?.data?.id}.${getRootDomain(
                        process.env.NEXT_PUBLIC_DASHBOARD_URL!
                      )}/.well-known/ai-plugin.json`
                    );
                    toast.success('Copied!', {
                      position: 'bottom-center',
                    });
                  }}
                >
                  {`https://${getDatastoreQuery?.data?.id}.${getRootDomain(
                    process.env.NEXT_PUBLIC_DASHBOARD_URL!
                  )}/.well-known/ai-plugin.json`}
                </Alert>
              </Stack>
              <Stack gap={2}>
                <Typography level="body2">openapi.yaml</Typography>
                <Alert
                  color="neutral"
                  sx={{
                    width: '100%',
                    cursor: 'copy',
                  }}
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `https://${getDatastoreQuery?.data?.id}.${getRootDomain(
                        process.env.NEXT_PUBLIC_DASHBOARD_URL!
                      )}/.well-known/openapi.yaml`
                    );
                    toast.success('Copied!', {
                      position: 'bottom-center',
                    });
                  }}
                >
                  {`https://${getDatastoreQuery?.data?.id}.${getRootDomain(
                    process.env.NEXT_PUBLIC_DASHBOARD_URL!
                  )}/.well-known/openapi.yaml`}
                </Alert>
              </Stack>
            </Stack>
          </UserPremium>
        </FormControl>
      </Box>

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
