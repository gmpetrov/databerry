import QueryStatsIcon from '@mui/icons-material/QueryStats';
import { Card, Typography } from '@mui/joy';
import {
  Area,
  AreaChart as NativeAreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

type Props<T> =
  | {
      data: T[];
      title: string;
      xkey: Exclude<keyof T, symbol>;
      area_key: Exclude<keyof T, symbol>;
      positive_area_key?: never;
      negative_area_key?: never;
      XAxisFormatter?(value: any, index: number): string;
    }
  | {
      data: T[];
      title: string;
      xkey: Exclude<keyof T, symbol>;
      positive_area_key: Exclude<keyof T, symbol>;
      negative_area_key: Exclude<keyof T, symbol>;
      area_key?: never;
      XAxisFormatter?(value: any, index: number): string;
    };

export default function AreaChart<T>({
  data,
  xkey,
  positive_area_key,
  negative_area_key,
  area_key,
  title,
  XAxisFormatter,
}: Props<T>) {
  const c1 = '#ff7675';
  const c2 = '#82ca9d';

  return (
    <Card variant="outlined" sx={{ px: 5, py: 2, mt: 4 }}>
      <Typography textAlign="center">{title}</Typography>

      <ResponsiveContainer width="100%" aspect={3}>
        {data.length === 0 ? (
          <div className="h-[335px]">
            <div className="flex flex-col items-center justify-center h-full">
              <QueryStatsIcon fontSize="xl5" color="primary" />
              <Typography color="primary">
                Insufficient Data For The Selected filters.
              </Typography>
            </div>
          </div>
        ) : (
          <NativeAreaChart
            width={730}
            height={250}
            data={data}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={c1} stopOpacity={0.8} />
                <stop offset="95%" stopColor={c1} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={c2} stopOpacity={0.8} />
                <stop offset="95%" stopColor={c2} stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey={xkey} tickFormatter={XAxisFormatter} />
            <YAxis />
            <Tooltip />
            {area_key && (
              <Area
                type="monotone"
                dataKey={area_key}
                stroke={c2}
                fillOpacity={1}
                fill={c2}
              />
            )}
            {negative_area_key && positive_area_key && (
              <>
                <Area
                  type="monotone"
                  dataKey={negative_area_key}
                  stroke={c1}
                  fillOpacity={1}
                  fill="url(#colorUv)"
                />
                <Area
                  type="monotone"
                  dataKey={positive_area_key}
                  stroke={c2}
                  fillOpacity={1}
                  fill="url(#colorPv)"
                />
              </>
            )}
          </NativeAreaChart>
        )}
      </ResponsiveContainer>
    </Card>
  );
}
