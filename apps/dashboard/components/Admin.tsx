import { useSession } from 'next-auth/react';

import { hasAdminRole } from '@chaindesk/lib/has-oneof-roles';

type Props = {
  children?: any;
};

function Admin(props: Props) {
  const { data: session, status } = useSession();

  const isAdmin = hasAdminRole(session?.roles);

  if (!isAdmin) {
    return null;
  }

  return props.children;
}

export default Admin;
