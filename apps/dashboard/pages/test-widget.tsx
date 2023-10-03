// import '../widgets/chat-bubble';

import dynamic from 'next/dynamic';
import { ReactElement, useState } from 'react';

import Layout from '@app/components/Layout';
export default function TestPage() {
  return (
    <>
      <main className="flex flex-col min-h-full">
        <h1>HELLO WORLR</h1>
      </main>
    </>
  );
}

TestPage.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};
