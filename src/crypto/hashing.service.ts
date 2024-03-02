import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as bcrypt from "bcrypt";

@Injectable()
export class HashingService {
  constructor(private readonly configService: ConfigService) {}

  async hash(value: any): Promise<any> {
    const salt = await bcrypt.genSalt();

    const hash = await bcrypt.hash(value, salt);

    return hash;
  }
  async isMatch({
    hash,
    value
  }: {
    hash: string;
    value: string;
  }): Promise<boolean> {
    return await bcrypt.compare(value, hash);
  }
}

export default HashingService;
