import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { CacheModule } from "../cache/cache.module";
import EncryptionService from "../crypto/encryption.service";
import HashingService from "../crypto/hashing.service";
import { JwtModule } from "../jwt/jwt.module";
import { UserModule } from "../user/user.module";
import { AuthService } from "./auth.service";

@Module({
  imports: [ConfigModule, UserModule, JwtModule, CacheModule],
  providers: [AuthService, HashingService, EncryptionService],
  exports: [AuthService]
})
export class AuthModule {}
