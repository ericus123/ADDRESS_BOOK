import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException
} from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import * as jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { TokenData } from "../auth/auth.service";
import { AuthErrors } from "../auth/constants";
import { CacheService } from "../cache/cache.service";
import HashingService from "../crypto/hashing.service";
import { InvalidTokenException, JwtService } from "../jwt/jwt.service";
import { MailService } from "../mail/mail.service";
import { Role, RoleName } from "../role/role.model";
import { RoleService } from "../role/role.service";
import { User } from "./user.model";

import {
  AuthResponse,
  GetUserInput,
  ProfileInput,
  SignupInput,
  TokenType
} from "./user.types";

class UnknownUserException extends NotFoundException {
  constructor() {
    super("Unknown User");
  }
}

class UserAlreadyVerifiedException extends BadRequestException {
  constructor() {
    super("User already verified");
  }
}
class UserNotVerifiedException extends BadRequestException {
  constructor() {
    super("User is not verified");
  }
}

@Injectable()
export class UserService {
  logger = new Logger("User Service");
  constructor(
    @InjectModel(User)
    private readonly userModel: typeof User,
    private readonly hashingService: HashingService,
    private readonly roleService: RoleService,
    private readonly mailService: MailService,
    private jwtService: JwtService,
    private readonly cacheService: CacheService
  ) {}

  async addUser(input: SignupInput): Promise<User> {
    try {
      input.password = await this.hashingService.hash(input.password);

      const user = await this.userModel.create({
        ...input,
        username: `${input.firstName}_${uuidv4(5)}`
      });
      const defaultRole = await this.roleService.getRole({
        type: "roleName",
        value: RoleName.DEFAULT
      });

      user.roleId = defaultRole.id;
      await user.save();
      const { firstName, email } = user;
      await this.sendMail({ firstName, email, type: TokenType.Verification });
      return user;
    } catch (error) {
      throw new Error(error);
    }
  }

  async sendVerificationEmail(email: string) {
    try {
      const user = await this.getUser({
        type: "EMAIL",
        value: email
      });

      if (!user) {
        throw new NotFoundException(AuthErrors.UNKNOWN_USER);
      }

      if (user?.isVerified) {
        throw new BadRequestException(AuthErrors.ACCOUNT_ALREADY_VERIFIED);
      } else {
        const { firstName, email } = user;
        await this.sendMail({ firstName, email, type: TokenType.Verification });
      }
    } catch (error) {
      throw new Error(error);
    }
  }

  async getUser({ type, value }: GetUserInput): Promise<User> {
    try {
      if (type === "EMAIL") {
        const user = await this.userModel.findOne({
          where: {
            email: value
          },
          include: [
            {
              model: Role,
              attributes: ["roleName", "description"]
            }
          ]
        });

        return user;
      }

      if (type === "ID") {
        const user = await this.userModel.findByPk(value, {
          include: [
            {
              model: Role,
              attributes: ["roleName", "description"]
            }
          ]
        });
        return user;
      }
    } catch (error) {
      throw new Error(error);
    }
  }
  async getUsers(): Promise<User[]> {
    try {
      const users = await this.userModel.findAll({
        include: [
          {
            model: Role,
            attributes: ["roleName", "description"]
          }
        ]
      });
      return users;
    } catch (error) {
      throw new Error(error);
    }
  }

  async updateProfile({
    input,
    email
  }: {
    input: ProfileInput;
    email: string;
  }): Promise<User> {
    try {
      const user = await this.getUser({
        type: "EMAIL",
        value: email
      });
      if (!user) {
        throw new Error("Unknown user");
      }

      return await user.update(input);
    } catch (error) {
      throw new Error(error);
    }
  }

  async sendMail({
    firstName,
    email,
    type
  }: {
    firstName: string;
    email: string;
    type: TokenType;
  }) {
    try {
      const token = await this.jwtService.generateToken(
        {
          data: {
            email,
            type
          }
        },
        { expiresIn: "5m" }
      );

      const template =
        type === TokenType.Verification
          ? this.mailService.getVerificationTemplate({
              firstName,
              token
            })
          : type === TokenType.Reset
          ? this.mailService.requestPasswordResetTemplate({ firstName, token })
          : "";
      await this.mailService.sendEmail({
        to: email,
        subject:
          type === TokenType.Verification
            ? "Verification email"
            : type === TokenType.Reset
            ? "Password Reset"
            : "Greetings!",
        html: template
      });
    } catch (error) {
      throw new Error("Something went wrong");
    }
  }

  async verifyUser({ token }: { token: string }): Promise<AuthResponse> {
    await this.jwtService.verifyToken(token);
    const _token: any = jwt.decode(token);

    if (
      !_token?.data?.email ||
      !_token?.data?.type ||
      _token?.data?.type != "Verification"
    ) {
      throw new InvalidTokenException();
    }

    const isBlacklisted = await this.cacheService.isBlacklisted(
      _token?.data?.email,
      token
    );

    if (isBlacklisted) {
      throw new InvalidTokenException();
    }

    const user = await this.getUser({
      type: "EMAIL",
      value: _token?.data?.email
    });

    if (!user) {
      throw new UnknownUserException();
    }

    if (user.isVerified) {
      throw new UserAlreadyVerifiedException();
    }

    try {
      user.isVerified = true;
      await user.save();

      await this.cacheService.set(
        `blacklist-${_token?.data?.email}`,
        token,
        5000
      );

      const payload: TokenData = {
        sub: user.id,
        email: user.email,
        isVerified: user.isVerified,
        role: user.role.roleName,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar
      };

      const tokens = await this.jwtService.generateAuthTokens(payload);
      return tokens;
    } catch (error) {
      throw new Error("Something went wrong");
    }
  }

  async requestPasswordReset({ email }: { email: string }) {
    try {
      const user = await User.findOne({
        where: {
          email
        }
      });

      if (!user) {
        throw new NotFoundException(AuthErrors.UNKNOWN_MEMBER);
      }
      await this.sendMail({
        firstName: user?.firstName,
        email,
        type: TokenType.Reset
      });
      return true;
    } catch (error) {
      throw new Error(error);
    }
  }

  async resetPassword({
    password,
    token
  }: {
    password: string;
    token: string;
  }) {
    const _token: any = await this.jwtService.verifyToken(token);
    const user = await this.getUser({
      type: "EMAIL",
      value: _token?.data?.email
    });
    if (
      !_token?.data?.email ||
      !_token?.data?.type ||
      _token?.data?.type != "Reset"
    ) {
      throw new InvalidTokenException();
    }

    const isBlacklisted = await this.cacheService.isBlacklisted(
      _token?.data?.email,
      token
    );

    if (isBlacklisted) {
      throw new InvalidTokenException();
    }

    if (!user) {
      throw new UnknownUserException();
    }

    const passMatch = await this.hashingService.isMatch({
      hash: user.password,
      value: password
    });

    if (passMatch) {
      throw new BadRequestException(AuthErrors.SAME_PASSWORD);
    }

    try {
      const newPass = await this.hashingService.hash(password);
      user.password = newPass;
      user.isVerified = true;
      await user.save();
      await this.cacheService.set(
        `blacklist-${_token?.data?.email}`,
        token,
        5000
      );
      return true;
    } catch (error) {
      throw new Error("Something went wrong");
    }
  }

  async assignRole({ email, roleName }: { email: string; roleName: RoleName }) {
    try {
      const user = await this.getUser({ type: "EMAIL", value: email });
      const role = await this.roleService.getRole({
        type: "roleName",
        value: roleName
      });
      user.roleId = role.id;
      await user.save();

      this.logger.debug("new role assigned to ", email);
    } catch (error) {
      this.logger.error(error);
      throw new Error(error);
    }
  }

  async verifyInvitationToken({ token }: { token: string }): Promise<string> {
    try {
      await this.jwtService.verifyToken(token);
      const _token: any = jwt.decode(token);

      if (
        !_token?.data?.email ||
        !_token?.data?.type ||
        _token?.data?.type != TokenType.Invitation
      ) {
        throw new InvalidTokenException();
      }

      const isBlacklisted = await this.cacheService.isBlacklisted(
        _token?.data?.email,
        token
      );

      if (isBlacklisted) {
        throw new InvalidTokenException();
      }

      return _token?.data?.email;
    } catch (error) {
      throw new Error(error);
    }
  }

  async getProfile(email: string): Promise<User> {
    try {
      const user = await this.userModel.findOne({
        where: { email },

        include: [
          {
            model: Role,
            attributes: ["roleName", "description"]
          }
        ]
      });
      return user;
    } catch (error) {
      throw new Error(error);
    }
  }
}
