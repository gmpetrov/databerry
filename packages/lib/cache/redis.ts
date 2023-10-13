import { createClient } from 'redis';

export default class RedisClient {
  private client: ReturnType<typeof createClient>;

  constructor() {
    this.initializeClient();
    this.connect();
  }

  async cacheKey({
    key,
    value,
    expiration,
  }: {
    key: string;
    value: string;
    expiration: number;
  }) {
    await Promise.all([
      this.client.set(key, value),
      this.client.expire(key, expiration),
    ]);
  }

  async retriveKey(key: string) {
    return this.client.get(key);
  }

  private async initializeClient() {
    const client = createClient();

    client.on('error', (err) => {
      throw new Error('Could initialized redis client', err);
    });

    this.client = client;
  }

  private async connect() {
    await this.client.connect();
  }

  async disconnect() {
    await this.client.quit();
  }
}
