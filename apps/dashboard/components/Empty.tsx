import Stack from '@mui/joy/Stack';
import Typography from '@mui/joy/Typography';
import Image from 'next/image';
import React from 'react';

type Props = {
  label?: string | JSX.Element;
};

function Empty({ label = 'No Data' }: Props) {
  return (
    <Stack
      sx={{
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
      }}
      gap={1}
    >
      <Image
        src="/landing-page/empty.png"
        alt="empty"
        width={100}
        height={100}
        style={{
          width: '150px',
          height: 'auto',
        }}
      />
      {label && typeof label === 'string' ? (
        <Typography level="body-md" color="neutral">
          {label}
        </Typography>
      ) : null}

      {label && typeof label !== 'string' ? label : null}
    </Stack>
  );
}

export default Empty;
