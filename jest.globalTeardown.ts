import terminate from 'terminate';

import prisma from './utils/prisma-client';

const globalTeardown = async () => {
  await prisma.user.delete({
    where: {
      id: process.env.TEST_USER_ID,
    },
  });

  const pid = (global as any).TEST_PROCESS_PID as number;

  terminate(pid, 'SIGINT', { timeout: 1000 }, (err) => {
    terminate(pid);
  });
};

export default globalTeardown;
