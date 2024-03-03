import { Field, ID, InputType, ObjectType } from "@nestjs/graphql";
import { IsEmail, IsUrl, Length } from "class-validator";
import { UUIDV4 } from "sequelize";
import {
  Column,
  DataType,
  Default,
  Index,
  Model,
  PrimaryKey,
  Table,
  Unique
} from "sequelize-typescript";
import { v4 as uuidv4 } from "uuid";

export enum AccessRights {
  USER = "USER",
  ADMIN = "ADMIN",
  SUPERADMIN = "SUPERADMIN"
}

@ObjectType()
@InputType("IUser")
@Table({
  timestamps: true,
  tableName: "User",
  omitNull: true,
  paranoid: true
})
export class User extends Model<User> {
  @Field((type) => ID)
  @Index
  @PrimaryKey
  @Default(UUIDV4)
  @Column({ type: DataType.STRING })
  id?: string = uuidv4();

  @Field({ nullable: true })
  @IsUrl({}, { message: "Invalid URL format for avatar" })
  @Column({ type: DataType.STRING })
  avatar: string;

  @Field()
  @Length(1, 255, {
    message: "First name must be between 1 and 255 characters"
  })
  @Column({ type: DataType.STRING })
  firstName: string;

  @Field()
  @Length(1, 255, { message: "Last name must be between 1 and 255 characters" })
  @Column({ type: DataType.STRING })
  lastName: string;

  @Field({ nullable: true })
  @Unique
  @Length(3, 10, { message: "Username must be between 1 and 20 characters" })
  @Column({ type: DataType.STRING })
  username: string;

  @Field()
  @Column({ type: DataType.STRING })
  password: string;

  @Field({ nullable: true })
  @Unique
  @IsEmail({}, { message: "Invalid email address" })
  @Column({ type: DataType.STRING })
  email: string;

  @Field((type) => String)
  @Default(() => AccessRights.USER)
  @Column({
    type: DataType.ENUM(...Object.values(AccessRights)),
    allowNull: false,
    defaultValue: AccessRights
  })
  accessRights: AccessRights;

  @Field()
  @Default(() => false)
  @Column({ type: DataType.BOOLEAN })
  isVerified: boolean;

  @Field()
  @Column({ type: DataType.DATE })
  createdAt: Date;

  @Field()
  @Column({ type: DataType.DATE })
  updatedAt: Date;

  @Field({ nullable: true })
  @Column({ type: DataType.DATE })
  deletedAt?: Date;
}
