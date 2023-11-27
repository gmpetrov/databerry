import { Card, Typography } from '@mui/joy';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

interface Props<T> {
  data: T[];
  title: string;
  xkey: Exclude<keyof T, symbol>;
  ykey?: Exclude<keyof T, symbol>;
  XAxisFormatter?(value: any, index: number): string;
  YAxisFormatter?(value: any, index: number): string;
  children: React.ReactNode;
}

function CustomLineChart<T>(
  {
    data,
    title,
    xkey,
    ykey,
    XAxisFormatter,
    YAxisFormatter,
    children,
  }: Props<T> = {} as any
) {
  return (
    <Card variant="outlined" sx={{ px: 5, py: 2, mt: 4 }}>
      <Typography textAlign="center">{title}</Typography>
      <ResponsiveContainer width="100%" aspect={3}>
        <LineChart
          height={300}
          data={data}
          margin={{
            top: 0,
            right: 10,
            left: -10,
            bottom: 5,
          }}
        >
          <XAxis dataKey={xkey} tickFormatter={XAxisFormatter} />
          <YAxis dataKey={ykey} tickFormatter={YAxisFormatter} />
          <Tooltip
            labelFormatter={XAxisFormatter as any}
            wrapperStyle={{ color: 'black' }}
          />
          <Legend />
          {children}
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}

CustomLineChart.Line = Line;

export default CustomLineChart;
