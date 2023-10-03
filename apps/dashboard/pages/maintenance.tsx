import WarningRounded from '@mui/icons-material/WarningRounded';
import { Alert, Box, Card, Typography } from '@mui/joy';

import Logo from '@app/components/Logo';

export default function MaintenancePage() {
  return (
    <>
      <Box
        sx={{
          height: '100vh',
          width: '100vw',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column',
          p: 4,
          gap: 4,
        }}
      >
        <Alert
          color="warning"
          variant="soft"
          size="lg"
          startDecorator={<WarningRounded />}
        >
          Maintenance in progress
        </Alert>

        <Card
          variant="outlined"
          className="flex flex-col items-center justify-center space-y-4 text-center"
        >
          <Logo className="w-24" />

          <Typography level="h4" fontWeight={'bold'}>
            Coming back soon
          </Typography>
        </Card>
      </Box>
    </>
  );
}
