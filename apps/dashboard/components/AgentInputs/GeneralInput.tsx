import AutorenewIcon from '@mui/icons-material/Autorenew';
import DeleteIcon from '@mui/icons-material/Delete';
import { AvatarGroup } from '@mui/joy';
import Avatar from '@mui/joy/Avatar';
import Button from '@mui/joy/Button';
import FormControl from '@mui/joy/FormControl';
import Stack from '@mui/joy/Stack';
import Typography from '@mui/joy/Typography';
import axios from 'axios';
import cuid from 'cuid';
import mime from 'mime-types';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import React, { useRef } from 'react';
import { useFormContext } from 'react-hook-form';
import toast from 'react-hot-toast';

import Input from '@app/components/Input';
import useAgent from '@app/hooks/useAgent';
import useStateReducer from '@app/hooks/useStateReducer';

import getS3RootDomain from '@chaindesk/lib/get-s3-root-domain';
import { RouteNames } from '@chaindesk/lib/types';
import {
  CreateAgentSchema,
  GenerateUploadLinkRequest,
} from '@chaindesk/lib/types/dtos';

type Props = {};

const CreateDatastoreModal = dynamic(
  () => import('@app/components/CreateDatastoreModal'),
  {
    ssr: false,
  }
);

function GeneralInput({}: Props) {
  const { watch, setValue, register, getValues, formState, control } =
    useFormContext<CreateAgentSchema>();

  const defaultIconUrl = `${process.env.NEXT_PUBLIC_DASHBOARD_URL}/images/chatbubble-default-icon-sm.gif`;

  const id = watch('id');
  const iconUrl = watch('iconUrl');
  const fileInputRef = useRef();

  const { mutation } = useAgent({
    id,
  });

  const [state, setState] = useStateReducer({
    isLoading: false,
    isUploadingAgentIcon: false,
    isUpdatingPlugin: false,
    iconUrl: iconUrl || defaultIconUrl,
  });

  React.useEffect(() => {
    if (iconUrl) {
      setState({
        iconUrl,
      });
    }
  }, [iconUrl]);

  const handleUploadAgentIcon = async (event: any) => {
    try {
      setState({ isUploadingAgentIcon: true });
      const file = event.target.files[0];
      const fileName = `${cuid()}.${mime.extension(file.type)}`;

      // upload text from file to AWS
      const uploadLinkRes = await axios.post(
        `/api/agents/${id}/generate-upload-link`,
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

      const iconUrl = `${getS3RootDomain()}/agents/${id}/${fileName}`;

      setState({
        iconUrl: iconUrl,
      });

      setValue('iconUrl', iconUrl, {
        shouldDirty: true,
        shouldValidate: true,
      });

      await mutation.trigger({
        ...getValues(),
        iconUrl,
      } as any);

      toast.success('Agent icon updated successfully!');
    } catch (err) {
      console.log(err, err);
    } finally {
      setState({ isUploadingAgentIcon: false });
    }
  };

  const handleDeleteAgentIcon = async () => {
    try {
      setState({ isUploadingAgentIcon: true });

      await mutation.trigger({
        ...getValues(),
        iconUrl: null,
      } as any);
      setState({ iconUrl: defaultIconUrl });
    } catch (err) {
    } finally {
      setState({ isUploadingAgentIcon: false });
    }
  };

  return (
    <Stack gap={2}>
      {id && (
        <Stack gap={1}>
          <Typography level="body-sm">Icon</Typography>
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
            </Stack>
          </Stack>
        </Stack>
      )}
      <Input control={control} label="Name (optional)" {...register('name')} />

      <FormControl>
        <Input
          control={control}
          label="Description"
          {...register('description')}
        />
        {/* <Typography level="body-xs" mt={1}>
          {'Describe what your agent can do.'}
        </Typography> */}
      </FormControl>
    </Stack>
  );
}

export default GeneralInput;
