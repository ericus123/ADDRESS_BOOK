import { Injectable, Logger, UnauthorizedException } from "@nestjs/common";
import { CacheService } from "../cache/cache.service";
import HashingService from "../crypto/hashing.service";
import { JwtService } from "../jwt/jwt.service";
import { UserService } from "../user/user.service";
import { AuthResponse, SigninInput, SignupInput } from "../user/user.types";
import { AuthErrors } from "./constants";

export type TokenData = {
  sub: string;
  email: string;
  isVerified: boolean;
  firstName: string;
  lastName: string;
  avatar?: string;
};
@Injectable()
export class AuthService {
  logger = new Logger("Auth Service");
  constructor(
    private readonly userService: UserService,
    private readonly hashingService: HashingService,
    private readonly cacheService: CacheService,
    private jwtService: JwtService
  ) {}

  async signin({ email, password }: SigninInput): Promise<AuthResponse> {
    try {
      const user = await this.userService.getUser({
        type: "EMAIL",
        value: email
      });

      if (!user) {
        throw new UnauthorizedException(AuthErrors.INVALID_CREDENTIALS);
      }

      const isMatch = await this.hashingService.isMatch({
        hash: user.password,
        value: password
      });
      if (!isMatch) {
        throw new UnauthorizedException(AuthErrors.PASS_DOESNT_MATCH);
      }

      const payload: TokenData = {
        sub: user.id,
        email: user.email,
        isVerified: user.isVerified,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar
      };

      const { accessToken, refreshToken } =
        await this.jwtService.generateAuthTokens(payload);
      return { accessToken, refreshToken };
    } catch (error) {
      throw new Error(error);
    }
  }

  async signup(input: SignupInput): Promise<AuthResponse> {
    const exist = await this.userService.getUser({
      type: "EMAIL",
      value: input.email
    });

    if (exist) {
      throw new UnauthorizedException(AuthErrors.ALREADY_REGISTERED);
    }

    this.logger.debug(input);

    const res = await this.userService.addUser({ ...input });
    const user = await this.userService.getUser({
      type: "EMAIL",
      value: res.email
    });
    try {
      const { email, isVerified, id, firstName, lastName, avatar } = user;
      const { accessToken, refreshToken } =
        await this.jwtService.generateAuthTokens({
          email,
          sub: id,
          isVerified,
          firstName,
          lastName,
          avatar
        });

      return { accessToken, refreshToken };
    } catch (error) {
      throw new Error(error);
    }
  }

  async signout({
    email,
    token
  }: {
    email: string;
    token: string;
  }): Promise<boolean> {
    try {
      const tok = await this.cacheService.set(
        `blacklist-${email}`,
        token,
        Number(process.env.SIGNOUT_EXP)
      );
      return true;
    } catch (error) {
      throw new Error(error);
    }
  }

  async isTokenBlacklisted({ email, token }: { email: string; token: string }) {
    try {
      const _blacklist = await this.cacheService.get(`blacklist-${email}`);
      return _blacklist === token;
    } catch (error) {
      throw new Error(error);
    }
  }
}
