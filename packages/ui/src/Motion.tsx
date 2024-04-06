import { motion, MotionProps } from 'framer-motion';
import React, { useRef } from 'react';

export type Props = Omit<MotionProps, 'children'> & {
  children: ({ ref }: { ref: React.ForwardedRef<any> }) => any;
};

export default motion(
  React.forwardRef<MotionProps, any>(function Motion(
    { children }: Pick<Props, 'children'>,
    ref
  ) {
    return (children as any)?.({
      ref,
    });
  })
) as React.FC<Props>;
