import { ChildProcess, spawn } from 'child_process';

import { prisma } from '@chaindesk/prisma/client';

import sleep from '@chaindesk/lib/sleep';

let p: ChildProcess | null = null;

const globalSetup = async () => {
  p = spawn('pnpm run dev:all:test', {
    shell: true,
    stdio: 'inherit',
  });

  (global as any).TEST_PROCESS_PID = p.pid;

  await sleep(1000);

  await prisma.user.create({
    data: {
      id: process.env.TEST_USER_ID,
      email: 'jest@chaindesk.ai',
      usage: {
        create: {},
      },
      apiKeys: {
        create: {
          key: process.env.TEST_USER_API_KEY!,
          id: `id_${process.env.TEST_USER_API_KEY_ID}`!,
        },
      },
      agents: {
        createMany: {
          data: [
            {
              id: process.env.TEST_PRIVATE_AGENT_ID!,
              name: 'Private Agent',
              description: 'This is a private agent',
              modelName: 'gpt_3_5_turbo',
              promptType: 'customer_support',
              prompt: 'Hello, my name is John, I am a customer support agent.',
              temperature: 0,
              visibility: 'private',
            },
            {
              id: process.env.TEST_PUBLIC_AGENT_ID!,
              name: 'Public Agent',
              description: 'This is a private agent',
              modelName: 'gpt_3_5_turbo',
              promptType: 'customer_support',
              prompt: 'Hello, my name is John, I am a customer support agent.',
              temperature: 0,
              visibility: 'public',
            },
          ],
        },
      },
      datastores: {
        create: {
          id: process.env.TEST_DATASTORE_ID,
          name: 'Private Datastore',
          type: 'qdrant',
          description: 'This is a private datastore',
          visibility: 'private',
        },
      },
    },
  });
};

export default globalSetup;
