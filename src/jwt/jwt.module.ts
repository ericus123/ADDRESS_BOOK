import { Module } from "@nestjs/common";
import { CacheModule } from "../cache/cache.module";
import EncryptionService from "../crypto/encryption.service";
import { JwtService } from "./jwt.service";

@Module({
  imports: [CacheModule],
  providers: [JwtService, EncryptionService],
  exports: [JwtService]
})
export class JwtModule {}
