import {
  createParamDecorator,
  ExecutionContext,
  SetMetadata
} from "@nestjs/common";
import { GqlExecutionContext } from "@nestjs/graphql";

export const ROLES_KEY = "roles";

export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);

export const CurrentUser = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext().req.user;
  }
);
