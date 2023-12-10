import autoAnimate, { AutoAnimateOptions } from '@formkit/auto-animate';
import { useAutoAnimate } from '@formkit/auto-animate/react';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { Stack, Typography } from '@mui/joy';
import { useEffect, useRef, useState } from 'react';

interface Props extends Partial<AutoAnimateOptions> {
  title: string;
  children: React.ReactNode;
}

const Dropdown = ({ title, children, ...rest }: Props) => {
  const [show, setShow] = useState(false);
  const [parent] = useAutoAnimate<HTMLDivElement>({
    easing: 'ease-in-out',
    duration: 300,
    ...rest,
  });

  const reveal = () => setShow(!show);

  return (
    <Stack ref={parent}>
      <Stack direction="row" onClick={reveal}>
        <KeyboardArrowDownIcon />
        <Typography className="cursor-pointer">{title}</Typography>
      </Stack>
      {show && (
        <Stack m={1} minHeight="100%">
          {' '}
          {children}
        </Stack>
      )}
    </Stack>
  );
};

export default Dropdown;
