'use client';

import getUTMparamsForPath from '@chaindesk/lib/get-utm-params-for-path';
import { usePathname, useSearchParams } from 'next/navigation';
import React from 'react';

type Props = {};

function useUTMqueryParmsForCurrentPath({}: Props = {}) {
  const pathname = usePathname();
  const searchParms = useSearchParams();

  const params = React.useMemo(() => {
    const res = `${new URLSearchParams({
      ...getUTMparamsForPath({ pathname }),
      ...Object.fromEntries(searchParms),
    }).toString()}`;

    return res ? `?${res}` : '';
  }, [pathname]);

  return {
    params,
  };
}

export default useUTMqueryParmsForCurrentPath;
