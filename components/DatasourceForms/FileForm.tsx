import AttachFileIcon from '@mui/icons-material/AttachFile';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { Alert, Button, Card, Chip, IconButton, Typography } from '@mui/joy';
import { DatasourceType, SubscriptionPlan } from '@prisma/client';
import { useSession } from 'next-auth/react';
import React, { useRef } from 'react';
import { useFormContext } from 'react-hook-form';
import { z } from 'zod';

import useStateReducer from '@app/hooks/useStateReducer';
import { UpsertDatasourceSchema } from '@app/types/models';
import excelToText from '@app/utils/excel-to-text';
import pdfToText from '@app/utils/pdf-to-text';
import pptxToText from '@app/utils/pptx-to-text';
import wordToText from '@app/utils/word-to-text';

import Base from './Base';
import type { DatasourceFormProps } from './types';

type Props = DatasourceFormProps & {};

export const FileForm = UpsertDatasourceSchema.extend({
  config: z.object({
    source: z.string(),
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
  const { control, register, setValue } =
    useFormContext<z.infer<typeof FileForm>>();
  const fileInputRef = useRef();

  const [state, setState] = useStateReducer({
    file: null as File | null,
    isDragEnter: false,
    isProcessing: false,
  });

  const handleSetFile = async (file: File) => {
    if (!file) {
      return;
    }

    setState({ isProcessing: true });

    let text = '';

    switch (file.type) {
      case 'text/csv':
      case 'text/plain':
      case 'text/markdown':
        text = await file.text();
        break;
      case 'application/pdf':
        text = await pdfToText(file);
        break;
      case 'application/vnd.openxmlformats-officedocument.presentationml.presentation':
        text = await pptxToText(file);
        break;
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        text = await wordToText(file);
        break;
      case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
        text = await excelToText(file);
        break;
      default:
        break;
    }

    setState({ isProcessing: false });

    if (!text) {
      alert('No text extracted from file. Please try another file.');
      return;
    }

    if (
      session?.user?.plan === SubscriptionPlan.free &&
      new Blob([text]).size / 1000000 > 1.1
    ) {
      alert(
        'File upload is limited to 5MB on the free plan. Contact support@databerry.ai to upgrade your account'
      );
      return;
    }

    setState({
      file,
    });

    setValue('name', file?.name);
    setValue('config.source', file?.name);
    setValue('datasourceText', text, { shouldDirty: true });
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
        type: DatasourceType.text,
      }}
    >
      <Nested />
    </Base>
  );
}
