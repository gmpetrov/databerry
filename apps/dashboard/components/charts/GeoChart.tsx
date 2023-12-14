import {
  Box,
  Card,
  Divider,
  Grid,
  LinearProgress,
  Skeleton,
  Stack,
  Typography,
} from '@mui/joy';
import React, { memo } from 'react';
import { Chart } from 'react-google-charts';

type Props = {
  label: string;
  data: any[];
  highestChats: number;
  loading?: boolean;
};

const ProgressBar = ({ total, amount }: { total: number; amount: number }) => {
  const progress = total > 0 ? (amount / total) * 100 : 0;
  return (
    <Box sx={{ width: '100%', mr: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Box sx={{ width: '100%', mr: 1 }}>
          <LinearProgress determinate value={progress} />
        </Box>
      </Box>
    </Box>
  );
};

const BarChartRow = ({
  country,
  chats,
  highestChats,
}: {
  country: string;
  chats: number;
  highestChats: number;
}) => {
  return (
    <Stack>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        spacing={2}
        sx={{ py: 1 }}
      >
        <Box sx={{ fontWeight: 'medium' }}>{country}</Box>
        <Stack direction="row" spacing={1}>
          <Box
            sx={{
              height: '8px',
              backgroundColor: 'primary.main',
              borderRadius: 'sm',
            }}
          />
          <Box sx={{ fontWeight: 'medium' }}>{chats}</Box>
        </Stack>
      </Stack>
      <ProgressBar total={highestChats} amount={chats} />
    </Stack>
  );
};

const BarChartTable = ({
  data,
  highestChats,
}: Pick<Props, 'data' | 'highestChats'>) => {
  return (
    <Box
      sx={{
        maxWidth: 'lg',
        px: 1,
        maxHeight: '400px',
        overflowY: 'auto',
      }}
    >
      <Stack
        direction="column"
        spacing={1}
        divider={<Divider orientation="horizontal" />}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          sx={{
            py: 1,
            position: 'sticky',
            top: 0,
            zIndex: 1,
            backgroundColor: 'background.body',
          }}
        >
          <Typography level="title-lg">Country</Typography>
          <Typography level="title-lg">Chats</Typography>
        </Stack>

        {data.map(([country, chats], index) => (
          <BarChartRow
            key={index}
            country={country}
            chats={chats}
            highestChats={highestChats}
          />
        ))}
      </Stack>
    </Box>
  );
};

function GeoChart({ label, data, highestChats, loading = false }: Props) {
  const highestChatsPerConversation = Math.max(
    ...data.map(([_, number]) => number)
  );
  const converter = new Intl.DisplayNames(['en'], { type: 'region' });
  const convertedData = data?.map(([country, chats]) => [
    typeof country === 'string' ? converter.of(country) : '',
    chats,
  ]);
  return (
    <Grid container spacing={2} sx={{ flexGrow: 1 }}>
      <Skeleton
        loading={loading}
        variant="rectangular"
        width="100%"
        height="400px"
        animation="wave"
      >
        <Grid xs={8}>
          <Chart
            chartType="GeoChart"
            height="400px"
            data={[['Country', label], ...data]}
          />
        </Grid>
        <Grid xs={4}>
          <BarChartTable
            data={convertedData}
            highestChats={highestChatsPerConversation}
          />
        </Grid>
      </Skeleton>
    </Grid>
  );
}

export default memo(GeoChart);
