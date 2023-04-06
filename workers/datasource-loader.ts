// TODO: Handle datasource loading with a worker

import Queue, { DoneCallback, Job } from 'bee-queue';
import Redis from 'ioredis';

const queue = new Queue('test-queue', {
  isWorker: true,
  redis: new Redis(process.env.REDIS_URL!),
});

// Process jobs from as many servers or processes as you like
queue.process((job: Job<any>, done: DoneCallback<any>) => {
  console.log(`Processing job ${job.id}`);
  return done(null, job.data.x + job.data.y);
});
