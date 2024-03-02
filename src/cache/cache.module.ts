import { Logger, Module } from "@nestjs/common";
import { CacheService } from "./cache.service";

@Module({
  imports: [],
  providers: [CacheService, Logger],
  exports: [CacheService]
})
export class CacheModule {}
