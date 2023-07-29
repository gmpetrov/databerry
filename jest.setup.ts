import { ChildProcess, spawn } from 'child_process';
import terminate from 'terminate';

import prisma from '@app/utils/prisma-client';

import sleep from './utils/sleep';

let p: ChildProcess | null = null;

beforeAll(async () => {
  if (!p) {
    p = spawn('pnpm run dev:all:test', {
      shell: true,
    });
  }

  await sleep(1000);

  await prisma.user.upsert({
    where: {
      id: process.env.TEST_USER_ID,
    },
    create: {
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
    update: {},
  });
});

afterAll(async () => {
  if (p) {
    terminate(p.pid!, 'SIGINT', { timeout: 1000 }, (err) => {
      terminate(p?.pid!);
    });
  }

  // await prisma.user.delete({
  //   where: {
  //     id: process.env.TEST_USER_ID,
  //   },
  // });
});
