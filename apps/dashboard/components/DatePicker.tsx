import { DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import dayjs from 'dayjs';
import { ComponentProps, useEffect } from 'react';

type Props =
  | {
      type: 'time';
      views: ComponentProps<typeof TimePicker>['views'];
      onChange(arg: any): void;
      defaultValue?: number;
    }
  | {
      type: 'date';
      onChange(arg: any): void;
      defaultValue?: string;
    };

export default function CustomDatePicker(props: Props) {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      {props.type === 'time' && (
        <TimePicker
          sx={{
            '& .MuiDialog-paper': {},
            maxWidth: '110px',
          }}
          views={props.views}
          defaultValue={
            props.defaultValue
              ? dayjs().hour(props.defaultValue).minute(0).second(0)
              : undefined
          }
          onChange={(e) => {
            (e as any).$H && props.onChange((e as any).$H);
          }}
        />
      )}
      {props.type === 'date' && (
        <DatePicker
          onChange={props.onChange}
          format="YYYY/MM/DD"
          defaultValue={dayjs(props.defaultValue)}
        />
      )}
    </LocalizationProvider>
  );
}
