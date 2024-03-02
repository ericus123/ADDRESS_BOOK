import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException
} from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { v4 as uuidv4 } from "uuid";
import HashingService from "../crypto/hashing.service";
import { assignUUID } from "../helpers";
import { User } from "../user/user.model";
import {
  AssignRoleInput,
  Role,
  RoleInput,
  RoleName,
  roleDescriptions
} from "./role.model";

@Injectable()
export class RoleService {
  logger = new Logger("RoleService");
  constructor(
    @InjectModel(Role)
    private readonly roleModel: typeof Role,
    private readonly hashingService: HashingService,

    @InjectModel(User)
    private readonly userModel: typeof User
  ) {
    (async () => {
      await this.initializeRoles();
      await this.initializeSuperAdmin();
    })();
  }

  async deleteRole(id: string): Promise<boolean> {
    try {
      const role = await this.getRole({ type: "id", value: id });
      await role.destroy();
      return true;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async updateRole(role: RoleInput, id: string): Promise<Role> {
    try {
      const _role = await this.getRole({ type: "id", value: id });
      return await _role.update(role);
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async getRole({
    type,
    value
  }: {
    type: "id" | "roleName";
    value: string;
  }): Promise<Role> {
    const _role =
      type === "id"
        ? await this.roleModel.findByPk(value)
        : await this.roleModel.findOne({
            where: {
              roleName: value
            }
          });

    return _role;
  }

  async getRoles(): Promise<Role[]> {
    try {
      return await this.roleModel.findAll({});
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async addRole(role: RoleInput): Promise<Role> {
    try {
      return await this.roleModel.create(assignUUID(role));
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async getRoleByName(roleName: RoleName): Promise<Role> {
    // try {
    return await this.roleModel.findOne({
      where: {
        roleName
      }
    });
    // } catch (error) {
    //   throw new NotFoundException("Role not found");
    // }
  }

  async initializeRoles(): Promise<void> {
    try {
      const rolesNames = Object.values(RoleName);

      this.logger.debug(rolesNames);

      for (const roleName of rolesNames) {
        const existingRole = await this.getRole({
          type: "roleName",
          value: roleName
        });

        if (!existingRole) {
          await this.addRole({
            roleName,
            description: roleDescriptions[roleName]
          });

          this.logger.debug(`New role ${roleName} added!`);
        }
      }
    } catch (error) {
      throw new Error(error);
    }
  }

  async assigUserRole(input: AssignRoleInput): Promise<boolean> {
    try {
      const { email, roleName } = input;

      const user = await this.userModel.findOne({
        where: {
          email
        },
        include: [
          {
            model: Role,
            attributes: ["roleName"]
          }
        ]
      });

      if (!user) {
        throw new NotFoundException("User not found");
      }

      if (user.role.roleName === roleName) {
        throw new Error("User already has the same role");
      }
      const role = await this.getRole({ type: "roleName", value: roleName });
      user.roleId = role.id;
      await user.save();

      return true;
    } catch (error) {
      this.logger.error(error);
      throw new Error(error);
    }
  }

  async initializeSuperAdmin() {
    try {
      const {
        SUPER_ADMIN_EMAIL,
        SUPER_ADMIN_FIRSTNAME,
        SUPER_ADMIN_LASTNAME,
        SUPER_ADMIN_PASSWORD
      } = process.env;

      const existing = await User.findOne({
        where: {
          email: SUPER_ADMIN_EMAIL
        }
      });

      if (!existing) {
        const role = await this.getRole({
          type: "roleName",
          value: RoleName.SUPER_ADMIN
        });

        const password = await this.hashingService.hash(SUPER_ADMIN_PASSWORD);
        await User.create({
          email: SUPER_ADMIN_EMAIL,
          firstName: SUPER_ADMIN_FIRSTNAME,
          lastName: SUPER_ADMIN_LASTNAME,
          password,
          roleId: role.id,
          isVerified: true,
          username: `${SUPER_ADMIN_FIRSTNAME}_${uuidv4(5)}`
        });

        this.logger.debug("Initialized a superAdmin user");
      }
    } catch (error) {
      this.logger.error("Error while initializing a superAdmin");
      console.log(error);
      throw new Error(error);
    }
  }
}
