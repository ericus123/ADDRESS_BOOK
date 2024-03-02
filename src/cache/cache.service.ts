import { Injectable, Logger } from "@nestjs/common";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const NodeCache = require("node-cache");

@Injectable()
export class CacheService {
  myCache: typeof NodeCache;
  logger: Logger = new Logger("CacheService");

  constructor(logger: Logger) {
    this.myCache = new NodeCache();
    this.logger = logger;

    this.myCache.on("set", (key, value) => {
      this.logger.log(`Redis key ${key} set with value ${value}`);
    });

    this.myCache.on("del", (key, value) => {
      this.logger.log(`Redis key ${key} deleted with value ${value}`);
    });

    this.myCache.on("expired", (key, value) => {
      this.logger.log(`Redis key ${key} expired with value ${value}`);
    });

    this.myCache.on("flush", () => {
      this.logger.log("Cache flushed");
    });
  }

  async set(key: string, value: any, ttl: number): Promise<boolean> {
    return this.myCache.set(key, value, ttl);
  }

  async get(key: string): Promise<typeof NodeCache.Key> {
    return this.myCache.get(key);
  }

  async delete(key: string): Promise<typeof NodeCache.Key> {
    return this.myCache.del(key);
  }

  async flush() {
    return this.myCache.flushAll();
  }

  async flushStats() {
    return this.myCache.flushStats();
  }

  async getStats(): Promise<typeof NodeCache.Stats> {
    return this.myCache.getStats();
  }
  async isBlacklisted(key: string, value: any) {
    return this.myCache.get(`blacklist-${key}`) === value;
  }
}
