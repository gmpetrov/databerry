import AttachFileRoundedIcon from '@mui/icons-material/AttachFileRounded';
import IconButton from '@mui/joy/IconButton';
import { useState } from 'react';

import Loader from '@chaindesk/ui/Loader';
import VisuallyHiddenInput from '@chaindesk/ui/VisuallyHiddenInput';

export default function FileUploader({
  changeCallback,
  placeholder,
  accept,
  variant = 'plain',
}: {
  changeCallback(files: File[]): any;
  variant?: 'outlined' | 'plain' | 'soft';
  placeholder?: string;
  accept?: string[];
}) {
  const [loading, setLoading] = useState<boolean | undefined>(undefined);
  return (
    <IconButton
      disabled={loading}
      size="sm"
      variant={variant}
      sx={{ maxHeight: '100%' }}
      component="label"
    >
      {loading ? (
        <Loader rootProps={{ style: { width: '40px', marginLeft: 2 } }} />
      ) : (
        <AttachFileRoundedIcon />
      )}

      <VisuallyHiddenInput
        accept={accept?.join?.(',')}
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
    </IconButton>
  );
}
