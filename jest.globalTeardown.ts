import terminate from 'terminate';

const globalTeardown = async () => {
  const pid = (global as any).TEST_PROCESS_PID as number;

  terminate(pid, 'SIGINT', { timeout: 1000 }, (err) => {
    terminate(pid);
  });
};

export default globalTeardown;
