import { RedisConnection } from 'bullmq';

import * as scripts from '../scripts';
export class RedisConnectionPro extends RedisConnection {
    async loadCommands(providedScripts) {
        const finalScripts = providedScripts || scripts;
        return super.loadCommands(finalScripts);
    }
}
//# sourceMappingURL=redis-connection-pro.js.map