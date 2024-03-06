import Box from '@mui/joy/Box';
import Card from '@mui/joy/Card';
import CardOverflow from '@mui/joy/CardOverflow';
import Divider from '@mui/joy/Divider';
import Stack from '@mui/joy/Stack';
import Typography from '@mui/joy/Typography';
import Image from 'next/image';
import React, { useEffect } from 'react';

import useConfetti from '@app/hooks/useConfetti';

// TEST
interface Props {
  Icon: React.ReactElement;
  header: string;
  description: React.ReactNode;
  Cta?: React.ReactElement;
  isConfettiActive?: boolean;
}

function FeedbackCard({
  Icon,
  header,
  description,
  Cta,
  isConfettiActive = false,
}: Props) {
  const triggerConfetti = useConfetti();

  useEffect(() => {
    if (isConfettiActive) {
      triggerConfetti();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConfettiActive]);

  return (
    <Stack
      sx={{
        p: 2,
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        // backgroundImage: 'linear-gradient(to top right, #ADD8E6, #C0A0C0)',
        backgroundColor: 'surface',
      }}
    >
      <Card
        sx={{
          maxWidth: 'sm',
          //   backgroundColor: '#cfe4fa',
          //   border: 0,
          //   boxShadow: 24,
        }}
        variant="outlined"
      >
        <CardOverflow>
          <Stack sx={{ py: 1 }}>
            <Stack
              direction="row"
              sx={{ mx: 'auto', alignItems: 'center', gap: 1 }}
            >
              <Box
                sx={{
                  //   mx: 'auto',
                  overflow: 'hidden',
                  borderRadius: '100%',
                  border: '2px solid',
                  borderColor: 'divider',
                  width: 45,
                  height: 45,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  p: 0.5,
                }}
              >
                <Image
                  width="100"
                  height="100"
                  src="/logo.png"
                  alt=""
                  className="w-full height-auto"
                />
              </Box>
              {/* <Typography level="body-md" sx={{ color: 'text.tertiary' }}>
                {header}
              </Typography> */}
            </Stack>
          </Stack>
          <Divider inset="context" />
        </CardOverflow>

        <Stack gap={1} sx={{ px: 2, py: 6 }}>
          <Stack
            direction="column"
            sx={{ mx: 'auto', alignItems: 'center' }}
            gap={3}
          >
            <Stack
              direction="column"
              sx={{ mx: 'auto', alignItems: 'center', gap: 1 }}
            >
              {React.cloneElement(Icon, {
                sx: { fontSize: '50px', color: 'primary.main' },
              })}
              <Typography
                level="h2"
                sx={{
                  textAlign: 'center',
                  fontWeight: 'bold',
                  color: 'primary.main',
                  textTransform: 'capitalize',
                }}
              >
                {header}
              </Typography>
            </Stack>
            <Typography level="title-md"> {description}</Typography>
          </Stack>
        </Stack>

        {Cta && (
          <CardOverflow>
            <Divider inset="context" />
            <Stack
              sx={{
                mx: 'auto',
                alignItems: 'center',
                justifyContent: 'center',
                py: 4,
              }}
            >
              {Cta}
            </Stack>
          </CardOverflow>
        )}
      </Card>
    </Stack>
  );
}

export default FeedbackCard;
