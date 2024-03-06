import clsx from 'clsx';
import Image from 'next/image';
import React, { forwardRef } from 'react';

interface Props extends React.HtmlHTMLAttributes<HTMLImageElement> {
  src?: string;
}

const Logo = forwardRef<HTMLImageElement, Props>(
  ({ className, ...otherProps }: Props, ref) => {
    return (
      <Image
        ref={ref}
        {...(otherProps as any)}
        width="200"
        height="200"
        className={clsx('w-5 h-auto', className)}
        alt="Chaindesk"
      />
    );
  }
);

Logo.defaultProps = {
  src: '/logo.png',
};

export default Logo;
