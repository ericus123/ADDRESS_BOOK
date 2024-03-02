import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { CacheModule } from "./cache/cache.module";
import { DatabaseModule } from "./database/database.module";

@Module({
  imports: [CacheModule, DatabaseModule, DatabaseModule],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
