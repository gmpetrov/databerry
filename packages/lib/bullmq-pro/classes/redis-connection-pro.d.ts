import { RawCommand,RedisConnection } from 'bullmq';
export declare class RedisConnectionPro extends RedisConnection {
    loadCommands(providedScripts?: Record<string, RawCommand>): Promise<void>;
}
