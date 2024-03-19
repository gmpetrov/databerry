import AttachFileRoundedIcon from '@mui/icons-material/AttachFileRounded';
import { Button } from '@mui/joy';
import { useState } from 'react';

import { acceptedMimeTypesStr } from './ChatBox';
import Loader from './Loader';
import VisuallyHiddenInput from './VisuallyHiddenInput';

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
  return (
    <Button
      disabled={loading}
      variant={variant}
      sx={{ maxHeight: '100%' }}
      size="sm"
      component="label"
    >
      {loading === false ? 'files loaded' : placeholder}
      {loading ? (
        <Loader rootProps={{ style: { width: '40px', marginLeft: 2 } }} />
      ) : (
        <AttachFileRoundedIcon />
      )}

      <VisuallyHiddenInput
        accept={acceptedMimeTypesStr}
        type="file"
        multiple
        onChange={async (e) => {
          setLoading(true);
          const f = Array.from(e.target.files!);

          const maxFileSize = 5000000; // 5MB

          const found = f.find((one) => one.size > maxFileSize);

          if (found) {
            e.target.value = '';
            return alert('File size is limited to 5MB');
          }

          await changeCallback(f);
          setLoading(false);
        }}
      />
    </Button>
  );
}
