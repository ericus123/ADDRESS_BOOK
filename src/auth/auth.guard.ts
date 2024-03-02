import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { GqlExecutionContext } from "@nestjs/graphql";
import { JwtService } from "../jwt/jwt.service";
import { RoleName } from "../role/role.model";
import { ROLES_KEY } from "./auth.decorators";
import { AuthService } from "./auth.service";
import { AuthErrors } from "./constants";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private reflector: Reflector,
    private readonly authService: AuthService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = GqlExecutionContext.create(context);
    let request = context.switchToHttp().getRequest();

    if (!request) {
      const ctx = GqlExecutionContext.create(context);
      request = ctx.getContext().req;
    }

    const { headers, res } = request;

    const accessToken = this.extractTokenFromHeader(headers);
    const refreshToken = headers["x-refresh-token"];

    if (!refreshToken) {
      throw new UnauthorizedException(AuthErrors.INVALID_HEADERS);
    }

    const isValidRefreshToken: any = await this.jwtService.verifyToken(
      refreshToken
    );
    const payload: any = await this.jwtService.verifyToken(accessToken);

    if (!isValidRefreshToken || !payload) {
      throw new UnauthorizedException(AuthErrors.INVALID_TOKEN);
    }

    if (!accessToken || !refreshToken) {
      throw new UnauthorizedException(AuthErrors.INVALID_HEADERS);
    }

    if (payload?.data?.sub !== isValidRefreshToken?.data?.userId) {
      throw new UnauthorizedException(AuthErrors.INVALID_TOKEN);
    }

    // if (payload?.data?.isVerified !== true) {
    //   throw new UnauthorizedException(AuthErrors.UNVERIFIED_ACCOUNT);
    // }

    if (
      payload.exp - Date.now() <
      Number(process.env.JWT_EXPIRATION_THRESHOLD)
    ) {
      const token = await this.jwtService.refreshAccessToken(payload.data.sub);
      if (!token) {
        throw new UnauthorizedException(AuthErrors.INVALID_TOKEN);
      }
      res.setHeader("Authorization", `Bearer ${token}`);
    }

    const userRole = payload?.data?.role;

    if (!userRole) {
      throw new UnauthorizedException(AuthErrors.INVALID_ROLES_OR_PERMISSIONS);
    }
    const requiredRoles = this.reflector.get<RoleName[]>(
      ROLES_KEY,
      context.getHandler()
    );
    if (
      requiredRoles &&
      requiredRoles.length > 0 &&
      !this.matchRoles(userRole, requiredRoles)
    ) {
      throw new UnauthorizedException(AuthErrors.INSUFFICIENT_ROLE);
    }

    const isBlacklisted = await this.authService.isTokenBlacklisted({
      email: payload.data.email,
      token: accessToken
    });
    if (isBlacklisted) {
      res.setHeader("Authorization", null);
      res.setHeader("x-refresh-token", null);
      throw new UnauthorizedException(AuthErrors.SESSION_EXIRED);
    }
    request.userEmail = payload.data.email;
    request.token = accessToken;
    return true;
  }

  private extractTokenFromHeader(headers: any): string | undefined {
    const token = headers["authorization"]?.split(" ");
    if (token?.length === 2 && token[0]?.toLowerCase() === "bearer") {
      return token[1];
    }
    return undefined;
  }

  private matchRoles(userRole: RoleName, requiredRoles: RoleName[]): boolean {
    return requiredRoles.includes(userRole);
  }
}
