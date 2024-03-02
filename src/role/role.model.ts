import { Field, ID, InputType, ObjectType } from "@nestjs/graphql";
import { IsEmail, IsEnum, IsNotEmpty } from "class-validator";
import {
  Column,
  DataType,
  Default,
  HasMany,
  Index,
  Model,
  PrimaryKey,
  Table
} from "sequelize-typescript";
import { v4 as uuidv4 } from "uuid";
import { User } from "../user/user.model";

export enum RoleName {
  SUPER_ADMIN = "SUPER_ADMIN",
  ADMIN = "ADMIN",
  DEFAULT = "DEFAULT"
}

export const roleDescriptions = {
  [RoleName.SUPER_ADMIN]: "Highest admin level, full system access.",
  [RoleName.ADMIN]: "Admin-level privileges, limited compared to super admin.",
  [RoleName.DEFAULT]: "Standard user, basic access rights."
};

@InputType()
export class AssignRoleInput {
  @IsEmail({}, { message: "Invalid email address" })
  @Field()
  email: string;

  @IsNotEmpty({ message: "Role name is required" })
  @Field()
  roleName: RoleName;
}

@InputType()
export class RoleInput {
  @Field(() => String)
  @IsEnum(RoleName, { message: "Invalid role name" })
  @Column({
    type: DataType.ENUM(...Object.values(RoleName)),

    unique: true
  })
  roleName?: RoleName;

  @Field(() => String, { nullable: true })
  @Column({ type: DataType.STRING })
  @IsNotEmpty({ message: "Description is required" })
  description?: string;
}

@ObjectType()
@InputType("IRole")
@Table({
  timestamps: true,
  tableName: "Role",
  omitNull: true,
  paranoid: true
})
export class Role extends Model<Role> {
  @Field((type) => ID)
  @Index
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column({ type: DataType.STRING })
  id?: string = uuidv4();

  @Field(() => String)
  @Column({
    type: DataType.ENUM(...Object.values(RoleName))
    // unique: true
  })
  roleName: RoleName;

  @Field(() => String, { nullable: true })
  @Column({ type: DataType.STRING })
  @IsNotEmpty({ message: "Description is required" })
  description: string;

  @HasMany(() => User)
  users: User[];

  @Field(() => Date, { nullable: true })
  @Column({ type: DataType.DATE })
  createdAt: Date;

  @Field(() => Date, { nullable: true })
  @Column({ type: DataType.DATE })
  updatedAt: Date;

  @Field(() => Date, { nullable: true })
  @Column({ type: DataType.DATE })
  deletedAt: Date;
}
