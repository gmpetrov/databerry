import AttachFileIcon from '@mui/icons-material/AttachFile';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { Alert, Button, Card, Chip, IconButton, Typography } from '@mui/joy';
import { DatasourceType } from '@prisma/client';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import React, { useEffect, useRef } from 'react';
import { useFormContext } from 'react-hook-form';
import { z } from 'zod';

import useStateReducer from '@app/hooks/useStateReducer';
import { UpsertDatasourceSchema } from '@app/types/models';

import Base from './Base';
import type { DatasourceFormProps } from './types';

type Props = DatasourceFormProps & {};

export const FileForm = UpsertDatasourceSchema.extend({
  file: z.any(),
  config: z.object({
    source: z.string(),
    type: z.string().optional(),
    fileSize: z.number().optional(),
    fileUploadPath: z.string().optional(),
  }),
});

const acceptedFileTypes = [
  'text/csv',
  'text/plain',
  'text/markdown',
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];

function Nested() {
  const { data: session, status } = useSession();
  const { control, register, setValue, reset, watch } =
    useFormContext<z.infer<typeof FileForm>>();
  const fileInputRef = useRef();

  const [state, setState] = useStateReducer({
    file: null as File | null,
    isDragEnter: false,
    isProcessing: false,
  });

  const datasourceText = watch('datasourceText');

  const handleSetFile = async (file: File) => {
    if (!file) {
      return;
    }

    if (!session?.user?.isPremium && file.size / 1000000 > 1.1) {
      alert(
        'File upload is limited to 1MB on the free plan. To subscribe: Click your profile picture > Upgrade Account'
      );
      return;
    }

    setState({
      file,
    });

    setValue('name', file?.name);
    setValue('file', file);
    setValue('config.source', file?.name);
    setValue('config.type', file?.type);
    setValue('config.fileSize', file?.size);
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
    setValue('name', '');
    setValue('config.source', '');
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
        {...register('config.source')}
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
