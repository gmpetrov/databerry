import { Box, Skeleton } from '@mui/joy';
import Card from '@mui/joy/Card';
import CardContent from '@mui/joy/CardContent';
import Typography from '@mui/joy/Typography';

interface Props {
  label: string;
  value: number | string | React.ReactNode;
  loading?: boolean;
}

export default function AnalyticsCard({
  label,
  value,
  loading = false,
}: Props) {
  return (
    <Card variant="outlined" color="neutral">
      <CardContent sx={{ textAlign: 'center', alignItems: 'center' }}>
        <Typography level="body-md">{label}</Typography>
        <Skeleton
          loading={loading}
          variant="rectangular"
          width="100%"
          height="100%"
          animation="wave"
        >
          <Box display="flex" gap={2}>
            <Typography level="h2" color="primary">
              {value}
            </Typography>
          </Box>
        </Skeleton>
      </CardContent>
    </Card>
  );
}
