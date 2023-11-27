import { Box } from '@mui/joy';
import Card from '@mui/joy/Card';
import CardContent from '@mui/joy/CardContent';
import Typography from '@mui/joy/Typography';

interface base {
  metric: string;
}

type Props = base &
  (
    | { metricSpecifier: string; quantity?: number }
    | { metricSpecifier?: string; quantity: number }
  );

export default function AnalyticsCard({
  metric,
  metricSpecifier,
  quantity,
}: Props) {
  return (
    <Card variant="outlined" color="neutral">
      <CardContent sx={{ textAlign: 'center', alignItems: 'center' }}>
        <Typography level="body-md">{metric}</Typography>
        <Box display="flex" gap={2}>
          {metricSpecifier && (
            <Typography sx={{ textTransform: 'capitalize' }}>
              {metricSpecifier}
            </Typography>
          )}
          <Typography>{quantity}</Typography>
        </Box>
      </CardContent>
    </Card>
  );
}
