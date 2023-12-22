import React, { useRef } from 'react';

import Motion, { Props as MotionProps } from './Motion';

type Props = MotionProps & {};

function MotionBottom({ ...otherProps }: Props) {
  return React.createElement(Motion, {
    ...otherProps,
    initial: {
      opacity: 0,
      translateY: '100px',
      ...(typeof otherProps.initial === 'object' ? otherProps.initial : {}),
    },
    animate: {
      opacity: 1,
      translateY: '0px',
      ...(typeof otherProps.animate === 'object' ? otherProps.animate : {}),
    },
    exit: {
      opacity: 0,
      ...(typeof otherProps.exit === 'object' ? otherProps.exit : {}),
    },
    transition: {
      duration: 0.2,
      ...(typeof otherProps.transition === 'object'
        ? otherProps.transition
        : {}),
    },
  });
}

export default MotionBottom;
