import { Box } from '@mui/joy';
import Card from '@mui/joy/Card';
import CardContent from '@mui/joy/CardContent';
import Typography from '@mui/joy/Typography';

interface Props {
  label: string;
  value: number | string | React.ReactNode;
}

export default function AnalyticsCard({ label, value }: Props) {
  return (
    <Card variant="outlined" color="neutral">
      <CardContent sx={{ textAlign: 'center', alignItems: 'center' }}>
        <Typography level="body-md">{label}</Typography>
        <Box display="flex" gap={2}>
          {/* {metricSpecifier && (
            <Typography sx={{ textTransform: 'capitalize' }}>
              {metricSpecifier}
            </Typography>
          )} */}
          {typeof value === 'string' || typeof value === 'number' ? (
            <Typography level="h2" color="primary">
              {value}
            </Typography>
          ) : (
            value
          )}
        </Box>
      </CardContent>
    </Card>
  );
}
