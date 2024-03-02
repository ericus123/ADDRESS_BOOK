import {
  Injectable,
  Logger,
  ServiceUnavailableException
} from "@nestjs/common";
import * as jwt from "jsonwebtoken";
import { TokenData } from "../auth/auth.service";
import { AuthErrors } from "../auth/constants";
import { CacheService } from "../cache/cache.service";
import EncryptionService from "../crypto/encryption.service";
import { AuthResponse, TokenType } from "../user/user.types";
export class InvalidTokenException extends Error {
  constructor() {
    super(AuthErrors.INVALID_TOKEN);
  }
}

@Injectable()
export class JwtService {
  logger = new Logger("JwtService");
  constructor(
    private readonly cacheService: CacheService,
    private readonly encryptionService: EncryptionService
  ) {}

  async generateToken(payload: any, options: jwt.SignOptions) {
    try {
      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        ...options
      });

      return token;
    } catch (error) {
      throw new ServiceUnavailableException(AuthErrors.SERVER_ERROR);
    }
  }

  async generateAuthTokens(payload: TokenData): Promise<AuthResponse> {
    try {
      await this.cacheService.delete(`blacklist-${payload.email}`);
      const accessToken = await this.generateToken(
        {
          data: {
            ...payload,
            type: TokenType.Access
          }
        },
        {
          expiresIn: Number(process.env.JWT_ACCESS_EXP)
        }
      );
      const refreshToken = await this.generateToken(
        {
          data: {
            type: TokenType.Refresh,
            userId: payload?.sub
          }
        },
        {
          expiresIn: Number(process.env.JWT_REFRESH_EXP)
        }
      );

      return {
        accessToken,
        refreshToken
      };
    } catch (error) {
      this.logger.error(error);
      throw new Error("Something went wrong");
    }
  }
  async saveRefreshToken({ userId, token }: { userId: string; token: string }) {
    try {
      this.cacheService.set(userId, token, Number(process.env.JWT_REFRESH_EXP));
    } catch (error) {
      throw new ServiceUnavailableException(AuthErrors.SERVER_ERROR);
    }
  }

  async refreshAccessToken(payload: TokenData): Promise<string> {
    try {
      //remove from blacklisted tokens
      await this.cacheService.delete(`blacklist-${payload.email}`);
      return await this.generateToken(
        {
          data: {
            ...payload,
            type: TokenType.Access
          }
        },
        {
          expiresIn: Number(process.env.JWT_ACCESS_EXP)
        }
      );
    } catch (error) {
      throw new ServiceUnavailableException(AuthErrors.SERVER_ERROR);
    }
  }

  async verifyToken(token: string) {
    try {
      const isValid = jwt.verify(token, process.env.JWT_SECRET);
      if (!isValid) {
        throw new InvalidTokenException();
      }
      return isValid;
    } catch (error) {
      throw new InvalidTokenException();
    }
  }
}
