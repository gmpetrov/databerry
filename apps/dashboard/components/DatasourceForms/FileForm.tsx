import AttachFileIcon from '@mui/icons-material/AttachFile';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import Alert from '@mui/joy/Alert';
import Button from '@mui/joy/Button';
import Card from '@mui/joy/Card';
import IconButton from '@mui/joy/IconButton';
import Typography from '@mui/joy/Typography';
import { useSession } from 'next-auth/react';
import React, { useEffect, useRef } from 'react';
import { useFormContext } from 'react-hook-form';
import { z } from 'zod';

import { AcceptedDatasourceFileMimeTypes } from '@chaindesk/lib/accepted-mime-types';
import accountConfig from '@chaindesk/lib/account-config';
import { DatasourceSchema } from '@chaindesk/lib/types/models';
import { DatasourceType } from '@chaindesk/prisma';
import useStateReducer from '@chaindesk/ui/hooks/useStateReducer';

import UsageLimitModal from '../UsageLimitModal';

import Base from './Base';
import type { DatasourceFormProps } from './types';

type DatasourceFile = Extract<DatasourceSchema, { type: 'file' }>;
type Props = DatasourceFormProps<DatasourceFile> & {};

function Nested() {
  const { data: session, status } = useSession();
  const { control, register, setValue, reset, watch, trigger } =
    useFormContext<DatasourceFile>();
  const fileInputRef = useRef();

  const [state, setState] = useStateReducer({
    file: null as File | null,
    isDragEnter: false,
    isProcessing: false,
    isUsageLimitModalOpen: false,
  });

  const datasourceText = watch('datasourceText');

  const handleSetFile = async (file: File) => {
    if (!file) {
      return;
    }

    if (
      file.size >
      accountConfig[session?.organization?.currentPlan!]?.limits?.maxFileSize
    ) {
      setState({ isUsageLimitModalOpen: true });
      return;
    }

    setState({
      file,
    });

    setValue('name', file?.name, { shouldDirty: true });
    setValue('file', file, { shouldDirty: true });
    setValue('config.file_url', file?.name, { shouldDirty: true });
    setValue('config.mime_type', file?.type, { shouldDirty: true });
    setValue('config.fileSize', file?.size, { shouldDirty: true });
    trigger();
  };

  const handleFileDrop = (event: any) => {
    event.preventDefault();

    const file = event.dataTransfer.files[0];

    handleSetFile(file);
  };

  const handleFileInputChange = async (event: any) => {
    const file = event.target.files[0];

    handleSetFile(file);
  };

  const handleRemoveFile = () => {
    setState({ file: null });
    reset();
    setValue('datasourceText', '', { shouldDirty: false });
  };

  useEffect(() => {
    setValue('file', {});
  }, [datasourceText]);

  if (datasourceText) {
    return null;
  }

  return (
    <>
      <input
        type="file"
        hidden
        accept={AcceptedDatasourceFileMimeTypes.join(',')}
        {...register('config.file_url')}
        onChange={handleFileInputChange}
        ref={fileInputRef as any}
      />

      {state.file && (
        <Alert
          startDecorator={
            <IconButton variant="plain" onClick={handleRemoveFile}>
              <CloseRoundedIcon />
            </IconButton>
          }
          variant="outlined"
          color="primary"
          sx={{ mr: 'auto' }}
          className="max-w-full truncate"
          size="sm"
        >
          {state?.file?.name}
        </Alert>
      )}
      {!state.file && (
        <Card
          variant="outlined"
          sx={{
            borderStyle: 'dashed',
            py: 6,
            ...(state.isDragEnter ? { borderColor: 'primary.main' } : {}),
          }}
          onDrop={handleFileDrop}
          onDragOver={(event) => {
            event.preventDefault();
          }}
          onDragEnter={() => setState({ isDragEnter: true })}
          onDragLeave={() => setState({ isDragEnter: false })}
        >
          <Button
            loading={state.isProcessing}
            onClick={() => {
              (fileInputRef as any).current?.click?.();
            }}
            startDecorator={<AttachFileIcon />}
            className="mx-auto"
            sx={{ ...(state.isDragEnter ? { pointerEvents: 'none' } : {}) }}
            color={state.isDragEnter ? 'primary' : 'neutral'}
            variant="soft"
          >
            Select or Drop file
          </Button>
          <Typography level="body-xs" textAlign={'center'} mt={2}>
            PDF, PowerPoint, Excel, Word, Text, Markdown,
          </Typography>
          <UsageLimitModal
            isOpen={state.isUsageLimitModalOpen}
            title="File size limit exceeded"
            description="Please upgrade your plan to upload larger files."
            handleClose={() =>
              setState({
                isUsageLimitModalOpen: false,
              })
            }
          />
        </Card>
      )}
    </>
  );
}

export default function WebPageForm(props: Props) {
  const { defaultValues, ...rest } = props;

  return (
    <Base
      schema={DatasourceSchema}
      {...rest}
      defaultValues={{
        ...props.defaultValues!,
        type: DatasourceType.file,
      }}
    >
      <Nested />
    </Base>
  );
}
