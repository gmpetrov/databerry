import { useColorScheme } from '@mui/joy';
import { useEffect } from 'react';

type Props = {};

function SynchTailwindColorMode({}: Props) {
  const { mode } = useColorScheme();

  useEffect(() => {
    if (mode) {
      try {
        document.body.classList.remove('dark');
        document.body.classList.remove('light');
        document.body.classList.add(mode);
      } catch {}
    }
  }, [mode]);
  return null;
}

export default SynchTailwindColorMode;
