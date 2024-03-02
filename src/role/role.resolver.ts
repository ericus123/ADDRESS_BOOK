import { UseGuards } from "@nestjs/common";
import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { Roles } from "../auth/auth.decorators";
import { AuthGuard } from "../auth/auth.guard";
import { AssignRoleInput, Role, RoleInput, RoleName } from "./role.model";
import { RoleService } from "./role.service";
@UseGuards(AuthGuard)
@Roles(RoleName.SUPER_ADMIN)
@Resolver("RoleResolver")
export class RoleResolver {
  constructor(private readonly roleService: RoleService) {}
  @Query(() => Role, { name: "GetRole" })
  async getRole(@Args("id") id: string): Promise<Role> {
    return this.roleService.getRole({ type: "id", value: id });
  }

  @Query(() => [Role], { name: "GetRoles" })
  async getRoles(): Promise<Role[]> {
    return this.roleService.getRoles();
  }

  @Mutation(() => Role, { name: "AddRole" })
  async addRole(@Args("role") role: RoleInput): Promise<Role> {
    return this.roleService.addRole(role);
  }
  @Mutation(() => Role, { name: "UpdateRole" })
  async updateRole(
    @Args("role") role: RoleInput,
    @Args("id") id: string
  ): Promise<Role> {
    return this.roleService.updateRole(role, id);
  }

  @Mutation(() => Boolean, { name: "DeleteRole" })
  async deleteRole(@Args("id") id: string): Promise<boolean> {
    return this.roleService.deleteRole(id);
  }

  @Mutation(() => Boolean, { name: "AssignRole" })
  async assignUserRole(
    @Args("input") input: AssignRoleInput
  ): Promise<boolean> {
    return this.roleService.assigUserRole(input);
  }
}
