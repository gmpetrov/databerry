import QueryStatsIcon from '@mui/icons-material/QueryStats';
import { Card, Skeleton, Stack, Typography } from '@mui/joy';
import dayjs from 'dayjs';
import { memo, useEffect, useMemo, useState } from 'react';
import {
  Area,
  AreaChart as NativeAreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import TimeLineNavigation from '../TimelineNavigation';
type Props<T> =
  | {
      data: T[];
      title: string;
      loading?: boolean;
      viewBy?: Exclude<keyof T, symbol | number>;
      aggregation?(
        key: string,
        data: Record<string, any>[]
      ): Record<string, any>;
      xkey: Exclude<keyof T, symbol>;
      area_key: Exclude<keyof T, symbol>;
      positive_area_key?: never;
      negative_area_key?: never;
      XAxisFormatter?(value: any, index: number): string;
    }
  | {
      data: T[];
      title: string;
      loading?: boolean;
      viewBy?: Exclude<keyof T, symbol | number>;
      aggregation?(
        key: string,
        data: Record<string, any>[]
      ): Record<string, any>;
      xkey: Exclude<keyof T, symbol>;
      positive_area_key: Exclude<keyof T, symbol>;
      negative_area_key: Exclude<keyof T, symbol>;
      area_key?: never;
      XAxisFormatter?(value: any, index: number): string;
    };

function AreaChart<T extends Record<string, any>>({
  data,
  xkey,
  viewBy,
  aggregation,
  positive_area_key,
  negative_area_key,
  area_key,
  title,
  XAxisFormatter,
  loading = false,
}: Props<T>) {
  const c1 = '#ff7675';
  const c2 = '#82ca9d';

  const keys = (
    area_key ? [area_key] : [positive_area_key, negative_area_key]
  ) as (keyof T)[];

  const maxYAxisValue = data.reduce((max, item) => {
    let values = keys.map((key) => item[key]);
    // Min ticks is 2
    return Math.max(max, ...values, 2);
  }, 0);

  const [aggregatedData, views] = useMemo(() => {
    const aggregated = viewBy ? aggregation!(viewBy, data) : data;
    const views = Object.keys(aggregated);
    return [aggregated, views];
  }, [aggregation, data, viewBy]);

  const [currentView, setCurrentView] = useState<number>(dayjs().year());

  useEffect(() => {
    /*
  default the view to the current year, or the most recent one
  if the current year is not present int the views.
  */
    setCurrentView(
      views.includes(dayjs().year().toString())
        ? dayjs().year()
        : Number(views[views.length - 1])
    );
  }, [views]);

  return (
    <Card variant="outlined" sx={{ px: 5, py: 2, mt: 4 }}>
      <Typography textAlign="center">{title}</Typography>

      {/* show timeline navigator if a viewBy timeline property provided */}
      {viewBy && (
        <Stack direction="row-reverse">
          <TimeLineNavigation
            currentValue={currentView!}
            values={views.map((view) => Number(view))}
            onChange={(v) => setCurrentView(v)}
          />
        </Stack>
      )}

      <Skeleton
        loading={loading}
        variant="rectangular"
        width="100%"
        height="100%"
        animation="wave"
      >
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
              data={
                viewBy
                  ? (aggregatedData as Record<string, any>)[currentView!]
                  : data
              }
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="c1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={c1} stopOpacity={0.8} />
                  <stop offset="95%" stopColor={c1} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="c2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={c2} stopOpacity={0.8} />
                  <stop offset="95%" stopColor={c2} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey={xkey} tickFormatter={XAxisFormatter} />
              <YAxis
                ticks={Array.from({ length: maxYAxisValue }).map(
                  (_, i) => i + 1
                )}
              />
              <Tooltip />
              {area_key && (
                <Area
                  type="monotone"
                  dataKey={area_key}
                  fillOpacity={1}
                  stroke={c2}
                  fill={'url(#c2)'}
                />
              )}
              {negative_area_key && positive_area_key && (
                <>
                  <Area
                    type="monotone"
                    dataKey={negative_area_key}
                    stroke={c1}
                    fillOpacity={1}
                    fill="url(#c1)"
                  />
                  <Area
                    type="monotone"
                    dataKey={positive_area_key}
                    stroke={c2}
                    fillOpacity={1}
                    fill="url(#c2)"
                  />
                </>
              )}
            </NativeAreaChart>
          )}
        </ResponsiveContainer>
      </Skeleton>
    </Card>
  );
}

export default memo(AreaChart) as typeof AreaChart;
