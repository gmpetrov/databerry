import clsx from 'clsx';
import React, { forwardRef } from 'react';

interface Props extends React.HtmlHTMLAttributes<HTMLImageElement> {
  src?: string;
}

const Logo = forwardRef<HTMLImageElement, Props>(
  ({ className, ...otherProps }: Props, ref) => {
    return (
      <img
        ref={ref}
        {...otherProps}
        className={clsx('h-auto w-12', className)}
        alt="Databerry"
      />
    );
  }
);

Logo.defaultProps = {
  src: '/databerry-logo-icon.png',
};

export default Logo;
