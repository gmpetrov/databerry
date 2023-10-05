import { ReactElement, useEffect, useState } from 'react';

import Layout from '@app/components/Layout';
export default function CloseWindow() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.close();
    }
  }, []);

  return <></>;
}

CloseWindow.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};
