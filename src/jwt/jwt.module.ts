import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { CacheModule } from "../cache/cache.module";
import EncryptionService from "../crypto/encryption.service";
import { JwtService } from "./jwt.service";

@Module({
  imports: [CacheModule, ConfigModule],
  providers: [JwtService, EncryptionService],
  exports: [JwtService]
})
export class JwtModule {}
