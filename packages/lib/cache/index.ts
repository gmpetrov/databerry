import redisClient from '../redis-client';

export default class Cache {
  constructor() {}

  async set({
    key,
    value,
    expiration,
  }: {
    key: string;
    value: string;
    expiration: number;
  }) {
    await redisClient.set(key, value);
    await redisClient.expire(key, expiration);
  }

  async get(key: string) {
    return redisClient.get(key);
  }
}
