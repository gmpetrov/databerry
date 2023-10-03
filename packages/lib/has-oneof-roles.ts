import { GlobalRole, MembershipRole } from '@chaindesk/prisma';

type Role = MembershipRole | GlobalRole;

const hasOneOfRoles = (roles: Role[]) => (userRoles?: Role[]) => {
  return (userRoles || []).some((role) => roles.includes(role));
};

export const hasAdminRole = hasOneOfRoles(['ADMIN', 'OWNER']);

export default hasOneOfRoles;
