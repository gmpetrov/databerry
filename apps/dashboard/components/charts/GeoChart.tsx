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

        {data?.map(([country, chats], index) => (
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

// browser env.
function convertToCountryName(countryCode: string) {
  try {
    const converter = new Intl.DisplayNames(['en'], { type: 'region' });
    return converter.of(countryCode);
  } catch (e) {
    // invalid country code
    return undefined;
  }
}

function GeoChart({ label, data, loading = false }: Props) {
  const newData = data?.reduce(
    (acc, [country, chats]) => {
      // filter out invalid country codes.
      if (convertToCountryName(country)) {
        acc.convertedData.push([convertToCountryName(country), chats]);
        if (acc.highestChatsPerConversation < chats) {
          acc.highestChatsPerConversation = chats;
        }
      }
      return acc;
    },
    { highestChatsPerConversation: 0, convertedData: [] }
  );

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
            data={[['Country', label], ...newData.convertedData]}
          />
        </Grid>
        <Grid xs={4}>
          <BarChartTable
            data={newData.convertedData}
            highestChats={newData.highestChatsPerConversation}
          />
        </Grid>
      </Skeleton>
    </Grid>
  );
}

export default memo(GeoChart);
