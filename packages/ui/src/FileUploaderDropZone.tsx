import AttachFileRoundedIcon from '@mui/icons-material/AttachFileRounded';
import ImageRoundedIcon from '@mui/icons-material/ImageRounded';
import Button from '@mui/joy/Button';
import Card from '@mui/joy/Card';
import Chip from '@mui/joy/Chip';
import ChipDelete from '@mui/joy/ChipDelete';
import IconButton from '@mui/joy/IconButton';
import Stack from '@mui/joy/Stack';
import Typography from '@mui/joy/Typography';
import { useCallback, useRef, useState } from 'react';

import { AcceptedMimeTypes } from '@chaindesk/lib/accepted-mime-types';
import VisuallyHiddenInput from '@chaindesk/ui/VisuallyHiddenInput';

const AcceptedMimeTypesStr = AcceptedMimeTypes.join(',');

export default function FileUploader({
  changeCallback,
  placeholder,
  variant = 'plain',
}: {
  changeCallback(files: File[]): any;
  variant?: 'outlined' | 'plain' | 'soft';
  placeholder?: string;
}) {
  const [loading, setLoading] = useState<boolean | undefined>(undefined);
  const [dragOver, setDragOver] = useState(false);
  const hiddenInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([] as File[]);

  // const handleChange: React.ChangeEventHandler<HTMLInputElement> = async (
  const handleChange = useCallback(
    async (
      // e
      _files: HTMLInputElement['files']
    ) => {
      setLoading(true);
      const maxFileSize = 10000000; // 10MB

      const filtered = Array.from(_files!).filter(
        (one) => !files.find((existing) => existing.name === one.name)
      );

      const found = filtered.find((one) => one.size > maxFileSize);

      if (found) {
        if (hiddenInputRef.current) {
          hiddenInputRef.current.value = '';
        }
        return alert('File size is limited to 10MB');
      } else {
        await changeCallback(filtered);
        setFiles([...files, ...filtered]);
        setLoading(false);
      }
    },
    [changeCallback, files]
  );

  const handleDragOver = useCallback<React.DragEventHandler<HTMLDivElement>>(
    (event) => {
      event.preventDefault();
      setDragOver(true);
    },
    []
  );

  const handleDragLeave = useCallback<React.DragEventHandler<HTMLDivElement>>(
    (event) => {
      event.preventDefault();
      setDragOver(false);
    },
    []
  );

  const handleDrop = useCallback<React.DragEventHandler<HTMLDivElement>>(
    (event) => {
      event.preventDefault();
      setDragOver(false);
      if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
        handleChange(event.dataTransfer.files);
        event.dataTransfer.clearData();
      }
    },
    [handleChange]
  );

  return (
    <Stack gap={1}>
      <Card
        component="div"
        sx={{ maxHeight: '100%', borderStyle: 'dashed' }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        color={dragOver ? 'primary' : 'neutral'}
        variant="outlined"
      >
        <Stack sx={{ justifyContent: 'center', alignItems: 'center' }} gap={1}>
          <ImageRoundedIcon sx={{ opacity: 0.5, fontSize: 32 }} />

          <Typography component="label" level="body-sm" color="neutral">
            Drop items here or{' '}
            <Typography
              component="label"
              color="primary"
              sx={{ cursor: 'pointer' }}
              level="body-sm"
              fontWeight="bold"
            >
              Browse files
              <VisuallyHiddenInput
                ref={hiddenInputRef}
                accept={AcceptedMimeTypesStr}
                type="file"
                multiple
                onChange={(e) => {
                  handleChange(e.target.files);
                }}
              />
            </Typography>
          </Typography>
        </Stack>
      </Card>
      <Stack direction="row" sx={{ flexWrap: 'wrap' }} gap={1}>
        {files.map((each, index) => (
          <Chip
            size="sm"
            key={each.name}
            variant="soft"
            color="primary"
            endDecorator={
              <ChipDelete
                disabled={loading}
                onDelete={async () => {
                  const filtered = files.filter((_, i) => i !== index);
                  setFiles(filtered);
                  await changeCallback(filtered);
                }}
              />
            }
          >
            {each.name}
          </Chip>
        ))}
      </Stack>
    </Stack>
  );
}
