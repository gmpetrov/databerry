import React, { useRef } from 'react';

import Motion, { Props as CustomMotionProps } from './Motion';

type Props = CustomMotionProps & {};

function MotionBottom({ ...otherProps }: Props) {
  return React.createElement(Motion, {
    initial: {
      opacity: 0,
      y: 20,
    },
    animate: {
      opacity: 1,
      y: 0,
    },
    exit: {
      opacity: 0,
    },
    transition: {
      duration: 0.15,
    },
    ...otherProps,
  });
}

export default MotionBottom;
