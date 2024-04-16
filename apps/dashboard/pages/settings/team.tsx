import Stack from '@mui/joy/Stack';
import { GetServerSidePropsContext } from 'next/types';
import { useSession } from 'next-auth/react';
import { ReactElement } from 'react';
import * as React from 'react';

import OrganizationForm from '@app/components/OrganizationForm';
import SettingsLayout from '@app/components/SettingsLayout';

import { withAuth } from '@chaindesk/lib/withAuth';

export default function TeamSettingsPage() {
  const { data: session } = useSession();

  if (!session?.organization) {
    return null;
  }

  return (
    <Stack sx={{ maxWidth: 'md', mx: 'auto', height: '100%' }}>
      <OrganizationForm />
    </Stack>
  );
}

TeamSettingsPage.getLayout = function getLayout(page: ReactElement) {
  return <SettingsLayout>{page}</SettingsLayout>;
};

// export const getServerSideProps = withAuth(
//   async (ctx: GetServerSidePropsContext) => {
//     return {
//       props: {},
//     };
//   }
// );
