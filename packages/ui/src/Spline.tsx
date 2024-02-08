import Button, { ButtonProps } from '@mui/joy/Button';
import React, { useEffect, useRef } from 'react';
import { Application } from '@splinetool/runtime';

type Props = React.ComponentProps<'canvas'> & {
  url: string;
  children?: any;
  // buttonProps: ButtonProps;
  // linkProps: React.AnchorHTMLAttributes<HTMLAnchorElement>;
};

export function Spline(props: Props) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (ref.current && props.url) {
      const app = new Application(ref.current!);
      app.load(props.url);
    }
  }, [props.url]);
  return <canvas {...props} ref={ref}></canvas>;
}

export default Spline;
