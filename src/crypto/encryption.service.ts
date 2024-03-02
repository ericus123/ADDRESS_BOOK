import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createCipheriv, createDecipheriv, randomBytes, scrypt } from "crypto";
import { promisify } from "util";

const iv = randomBytes(16);

@Injectable()
export class EncryptionService {
  constructor(private readonly configService: ConfigService) {}
  async encrypt(data: any): Promise<Buffer> {
    const key = (await promisify(scrypt)(
      data,
      this.configService.get("ENCRYPTION_KEY"),
      32
    )) as Buffer;
    const cipher = createCipheriv("aes-256-cbc", key, iv);

    const encryptedText = Buffer.concat([cipher.update(data), cipher.final()]);

    return encryptedText;
  }

  async decrypt({ encryptedText }: { encryptedText: Buffer }): Promise<Buffer> {
    const decipher = createDecipheriv(
      "aes-256-ctr",
      this.configService.get("ENCRYPTION_KEY"),
      iv
    );
    const decryptedText = Buffer.concat([
      decipher.update(encryptedText),
      decipher.final()
    ]);
    return decryptedText;
  }
}

export default EncryptionService;
