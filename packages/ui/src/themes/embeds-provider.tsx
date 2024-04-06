import { useMemo } from 'react';
import ThemeProvider, { ThemeProviderProps } from './provider';
import { createTheme } from './base';

export default function EmbedsProvider(props: ThemeProviderProps) {
  const theme = useMemo(() => {
    return createTheme({
      container: props.container,
      prefix: props.prefix,
    });
  }, [props.container, props.prefix]);
  return (
    <ThemeProvider
      theme={theme}
      disableNestedContext
      defaultMode="light"
      {...props}
    />
  );
}
