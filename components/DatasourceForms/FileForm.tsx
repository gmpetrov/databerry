import AttachFileIcon from '@mui/icons-material/AttachFile';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import Alert from '@mui/joy/Alert';
import Button from '@mui/joy/Button';
import Card from '@mui/joy/Card';
import IconButton from '@mui/joy/IconButton';
import Typography from '@mui/joy/Typography';
import { DatasourceType } from '@prisma/client';
import { useSession } from 'next-auth/react';
import React, { useEffect, useRef } from 'react';
import { useFormContext } from 'react-hook-form';
import { z } from 'zod';

import useStateReducer from '@app/hooks/useStateReducer';
import { UpsertDatasourceSchema } from '@app/types/models';
import accountConfig from '@app/utils/account-config';

import UsageLimitModal from '../UsageLimitModal';

import Base from './Base';
import type { DatasourceFormProps } from './types';

type Props = DatasourceFormProps & {};

export const FileForm = UpsertDatasourceSchema.extend({
  file: z.any(),
  config: z.object({
    source_url: z.string(),
    mime_type: z.string(),
    fileSize: z.number().optional(),
    fileUploadPath: z.string().optional(),
  }),
});

const acceptedFileTypes = [
  'text/csv',
  'text/plain',
  'text/markdown',
  'application/pdf',
  'application/json',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];

function Nested() {
  const { data: session, status } = useSession();
  const { control, register, setValue, reset, watch, trigger } =
    useFormContext<z.infer<typeof FileForm>>();
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
      accountConfig[session?.user?.currentPlan!]?.limits?.maxFileSize
    ) {
      setState({ isUsageLimitModalOpen: true });
      return;
    }

    setState({
      file,
    });

    setValue('name', file?.name, { shouldDirty: true });
    setValue('file', file, { shouldDirty: true });
    setValue('config.source_url', file?.name, { shouldDirty: true });
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
        accept={acceptedFileTypes.join(',')}
        {...register('config.source_url')}
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
          <Typography level="body3" textAlign={'center'} mt={2}>
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
      schema={FileForm}
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
