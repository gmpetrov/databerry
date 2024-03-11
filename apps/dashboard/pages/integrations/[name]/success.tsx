import Box from '@mui/joy/Box';
import Card from '@mui/joy/Card';
import CardContent from '@mui/joy/CardContent';
import Typography from '@mui/joy/Typography';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

import useConfetti from '@app/hooks/useConfetti';

function Success() {
  const router = useRouter();
  const triggerConfetti = useConfetti();

  useEffect(() => {
    triggerConfetti();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!router.query.name) {
    return null;
  }

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        width: '100vw',
      }}
    >
      <Card
        sx={{
          minWidth: 275,
          boxShadow: 3,
        }}
      >
        <CardContent
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Image
            className="w-8"
            src={`/${router.query.name}-logo.png`}
            width={100}
            height={100}
            alt="shopify logo"
          ></Image>
          <Typography level="h3">Installation Succeeded</Typography>
          <Typography sx={{ mb: 1.5 }}>
            You can now close this window.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}

export default Success;
