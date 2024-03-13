import Link, { LinkProps } from 'next/link';
import React, { Suspense } from 'react';
import useUTMqueryParmsForCurrentPath from './hooks/useUTMqueryParmsForCurrentPath';

type Props = LinkProps & {
  className?: string;
  children?: any;
};

function LinkWithUTMFromPath({ href, ...otherProps }: Props) {
  const { params } = useUTMqueryParmsForCurrentPath();

  return <Link href={`${href}${params}`} {...otherProps} />;
}

function Wrapper(props: Props) {
  return (
    <Suspense fallback={<Link {...props} />}>
      <LinkWithUTMFromPath {...props} />
    </Suspense>
  );
}

export default Wrapper;
