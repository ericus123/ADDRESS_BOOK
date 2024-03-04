import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import EncryptionService from "./encryption.service";
import HashingService from "./hashing.service";

@Module({
  imports: [ConfigModule],
  providers: [EncryptionService, HashingService],
  exports: [EncryptionService, HashingService]
})
export class CryptoModule {}
