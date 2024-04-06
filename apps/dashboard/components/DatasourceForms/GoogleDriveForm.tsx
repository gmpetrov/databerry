import AddIcon from '@mui/icons-material/Add';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightIcon from '@mui/icons-material/ChevronRightRounded';
import { Alert, Checkbox } from '@mui/joy';
import Autocomplete from '@mui/joy/Autocomplete';
import AutocompleteOption from '@mui/joy/AutocompleteOption';
import Button from '@mui/joy/Button';
import CircularProgress from '@mui/joy/CircularProgress';
import FormControl from '@mui/joy/FormControl';
import FormHelperText from '@mui/joy/FormHelperText';
import FormLabel from '@mui/joy/FormLabel';
import IconButton from '@mui/joy/IconButton';
import ListItemContent from '@mui/joy/ListItemContent';
import Option from '@mui/joy/Option';
import Select from '@mui/joy/Select';
import Stack from '@mui/joy/Stack';
import axios from 'axios';
import React from 'react';
import { useFormContext } from 'react-hook-form';
import useSWR from 'swr';
import { z } from 'zod';

import type { getServiceProviders } from '@app/pages/api/accounts/service-providers';

import getDrives from '@chaindesk/integrations/google-drive/api/drives';
import { listFolder } from '@chaindesk/integrations/google-drive/api/folders';
import { fetcher } from '@chaindesk/lib/swr-fetcher';
import {
  DatasourceGoogleDrive,
  DatasourceSchema,
} from '@chaindesk/lib/types/models';
import { DatasourceType, Prisma, ServiceProviderType } from '@chaindesk/prisma';
import useStateReducer from '@chaindesk/ui/hooks/useStateReducer';

import Base from './Base';
import type { DatasourceFormProps } from './types';

type Props = DatasourceFormProps<DatasourceGoogleDrive> & {};

function Nested() {
  const { control, register, setValue, formState, trigger, watch } =
    useFormContext<DatasourceGoogleDrive>();

  const [state, setState] = useStateReducer({
    currentProviderId: '',
    currentFolderId: '',
    folderCrumbs: [] as string[],
  });

  const autocompletRef = React.useRef();

  const getProvidersQuery = useSWR<
    Prisma.PromiseReturnType<typeof getServiceProviders>
  >(
    `/api/accounts/service-providers?type=${ServiceProviderType.google_drive}`,
    fetcher,
    {
      refreshInterval: 5000,
    }
  );

  const getDrivesQuery = useSWR<Prisma.PromiseReturnType<typeof getDrives>>(
    state.currentProviderId
      ? `/api/integrations/google-drive/drives?providerId=${state.currentProviderId}`
      : null,
    fetcher
  );

  const listFolderQuery = useSWR<Prisma.PromiseReturnType<typeof listFolder>>(
    state.currentProviderId
      ? `/api/integrations/google-drive/folders?providerId=${state.currentProviderId}&folderId=${state.currentFolderId}`
      : null,
    fetcher
  );

  const handleSignIn = async (e: any) => {
    e.preventDefault();
    e.stopPropagation();

    const res = await axios.get('/api/integrations/google-drive/add');

    const url = res.data?.url;

    window.open(url, '_blank', 'width=800,height=800');
  };

  const id = watch('id');
  const hasOptIn = watch('hasOptIn');

  console.log('ID--------->', id);
  console.log('hasOptIn--------->', hasOptIn);
  return (
    <>
      <Stack gap={2}>
        <FormControl>
          <FormLabel>Select Account</FormLabel>
          {/* <Button onClick={handleSignIn}>Google Drive: Sign-In</Button> */}

          <Stack gap={1}>
            <Select
              {...register('config.serviceProviderId')}
              onChange={(_, value) => {
                setState({
                  currentProviderId: value as string,
                });

                setValue('config.serviceProviderId', value as string, {
                  shouldDirty: true,
                });
              }}
            >
              {getProvidersQuery.data?.map((provider) => (
                <Option key={provider.id} value={provider.id}>
                  {provider.name || provider.id}
                </Option>
              ))}
            </Select>
            <Button
              startDecorator={<AddIcon />}
              onClick={handleSignIn}
              variant={'plain'}
              sx={{ mr: 'auto' }}
            >
              Google Drive: Add Account
            </Button>
          </Stack>
        </FormControl>

        <Stack gap={1}>
          <FormControl error={!!formState?.errors?.config?.objectId?.message}>
            {state.currentProviderId && (
              <Stack
                gap={1}
                direction={'row'}
                alignItems={'center'}
                width={'100%'}
              >
                {state.currentFolderId && (
                  <IconButton
                    variant="solid"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();

                      const arr = [...state.folderCrumbs];
                      const lastFolderId = arr.pop() || '';

                      setState({
                        currentFolderId: lastFolderId,
                        folderCrumbs: arr,
                      });

                      // autocompletRef.current?.focus();

                      console.log(autocompletRef);
                    }}
                  >
                    <ChevronLeftIcon />
                  </IconButton>
                )}

                <Autocomplete
                  // {...register('config.objectId')}
                  sx={{
                    width: '100%',
                  }}
                  loading={listFolderQuery?.isLoading}
                  placeholder="Select Folder or Single File"
                  slotProps={{
                    listbox: {
                      sx: (theme) => ({
                        zIndex: theme.vars.zIndex.modal,
                      }),
                    },
                  }}
                  getOptionLabel={(option) => option?.label!}
                  options={(listFolderQuery.data?.files || [])?.map(
                    (folder, index) => ({
                      index,
                      id: folder.id!,
                      label: folder.name || folder.id,
                      mimeType: folder.mimeType,
                    })
                  )}
                  startDecorator={
                    listFolderQuery?.isLoading ? (
                      <CircularProgress
                        size="sm"
                        sx={{ bgcolor: 'background.surface' }}
                      />
                    ) : null
                  }
                  onChange={(_, value) => {
                    setValue('name', value?.label! || '', {
                      shouldDirty: true,
                    });
                    setValue('config.source_url', '', {
                      shouldDirty: true,
                    });
                    setValue('config.objectId', value?.id! || '', {
                      shouldDirty: true,
                    });
                    setValue('config.mime_type', value?.mimeType! || '', {
                      shouldDirty: true,
                    });
                    if (
                      value?.mimeType === 'application/vnd.google-apps.folder'
                    ) {
                      setValue('type', DatasourceType.google_drive_folder, {
                        shouldDirty: true,
                      });
                    } else {
                      setValue('type', DatasourceType.google_drive_file, {
                        shouldDirty: true,
                      });
                    }
                    trigger();
                  }}
                  renderOption={(props, option) => (
                    <Stack key={option.id}>
                      <AutocompleteOption {...props}>
                        <ListItemContent>
                          <Stack direction="row" gap={2} alignItems="center">
                            {option.mimeType ===
                              'application/vnd.google-apps.folder' && (
                              <IconButton
                                size="sm"
                                color="neutral"
                                onClick={(e: any) => {
                                  e.stopPropagation();
                                  e.preventDefault();

                                  setState({
                                    currentFolderId: option.id,
                                    folderCrumbs: [
                                      ...state.folderCrumbs,
                                      state.currentFolderId,
                                    ],
                                  });
                                }}
                              >
                                <ChevronRightIcon />
                              </IconButton>
                            )}

                            {option.label}
                          </Stack>
                        </ListItemContent>
                      </AutocompleteOption>
                    </Stack>
                  )}
                />
              </Stack>
            )}

            {formState?.errors?.config?.objectId?.message && (
              <FormHelperText>
                {formState?.errors?.config?.objectId?.message}
              </FormHelperText>
            )}
          </FormControl>

          {!id && (
            <Alert>
              <Checkbox
                sx={{ mt: 2 }}
                {...register('hasOptIn')}
                label="I acknowledge and consent to the transfer of subsets of my data to large language model providers as part of the service's functionality and improvement."
              />
            </Alert>
          )}
        </Stack>
      </Stack>
    </>
  );
}

export default function GoogleDriveForm(props: Props) {
  const { defaultValues, ...rest } = props;

  return (
    <Base
      schema={DatasourceSchema.refine(
        (val) => {
          return (val as any).hasOptIn === true;
        },
        {
          message: 'Please aknowledge the opt-in.',
        }
      )}
      {...rest}
      defaultValues={{
        ...props.defaultValues!,
        type: DatasourceType.google_drive_file,
        hasOptIn: !!props?.defaultValues?.id,
      }}
    >
      {!defaultValues?.id && <Nested />}
    </Base>
  );
}
