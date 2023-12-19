import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { IconButton, Stack, Typography } from '@mui/joy';
import { useMemo } from 'react';
import useDeepCompareEffect from 'use-deep-compare-effect';

import useStateReducer from '@app/hooks/useStateReducer';

type Props = {
  values: number[];
  currentValue: number;
  onChange(arg: number): void;
};

function TimeLineNavigation({ values, currentValue, onChange }: Props) {
  const sortedvalues = useMemo(
    () => [...values].sort((a, b) => a - b),
    [values]
  );

  const [state, setState] = useStateReducer({
    current: currentValue,
    canMoveBack: false,
    canMoveForward: false,
  });

  const moveBack = () => {
    const currentValueIndex = sortedvalues.indexOf(currentValue);
    const nextIndex = Math.max(0, currentValueIndex - 1);
    setState({
      current: sortedvalues[nextIndex],
      canMoveBack: sortedvalues[nextIndex] > sortedvalues[0],
      canMoveForward:
        sortedvalues[nextIndex] < sortedvalues[sortedvalues.length - 1],
    });

    onChange(sortedvalues[nextIndex]);
  };

  const moveForward = () => {
    const currentValueIndex = sortedvalues.indexOf(currentValue);
    const nextIndex = Math.min(sortedvalues.length - 1, currentValueIndex + 1);
    setState({
      current: sortedvalues[nextIndex],
      canMoveBack: sortedvalues[nextIndex] > sortedvalues[0],
      canMoveForward:
        sortedvalues[nextIndex] < sortedvalues[sortedvalues.length - 1],
    });
    onChange(sortedvalues[nextIndex]);
  };

  useDeepCompareEffect(() => {
    setState({
      // important: check if the current value is a valid one.
      current: sortedvalues?.includes(currentValue)
        ? currentValue
        : sortedvalues?.[sortedvalues.length - 1],
      canMoveBack: currentValue > sortedvalues[0],
      canMoveForward: currentValue < sortedvalues[sortedvalues.length - 1],
    });
  }, [sortedvalues, currentValue]);

  return (
    <Stack direction="row" justifyContent="center" alignItems="center">
      <IconButton size="sm" onClick={moveBack} disabled={!state.canMoveBack}>
        <ArrowBackIosNewIcon fontSize="md" />
      </IconButton>
      <Typography color="primary">{state.current}</Typography>
      <IconButton
        size="sm"
        onClick={moveForward}
        disabled={!state.canMoveForward}
      >
        <ArrowForwardIosIcon fontSize="md" />
      </IconButton>
    </Stack>
  );
}

export default TimeLineNavigation;
