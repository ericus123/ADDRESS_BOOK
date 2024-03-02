import { Field, InputType, ObjectType } from "@nestjs/graphql";
import {
  IsEmail,
  IsNotEmpty,
  IsPhoneNumber,
  IsStrongPassword,
  IsUrl,
  Length,
  MaxLength,
  MinLength
} from "class-validator";
import { Column, DataType } from "sequelize-typescript";

export type UserFindType = "EMAIL" | "ID";
@InputType()
@ObjectType()
export class GetUserInput {
  @Field({ nullable: false })
  type: UserFindType;
  @Field({ nullable: false })
  value: string;
}

@InputType()
@ObjectType()
export class SigninInput {
  @Field({ nullable: false })
  @IsNotEmpty()
  @IsEmail()
  @Column({ type: DataType.STRING })
  email: string;

  @Field({ nullable: false })
  @IsNotEmpty()
  @MinLength(6)
  @Column({ type: DataType.STRING })
  password: string;
}

@ObjectType()
export class AuthResponse {
  @Field({ nullable: false })
  accessToken: string;
  @Field({ nullable: false })
  refreshToken: string;
}
@InputType()
@ObjectType()
export class SignupInput {
  @Field({ nullable: false })
  @MinLength(2)
  @MaxLength(16)
  @Column({ type: DataType.STRING })
  firstName: string;

  @Field({ nullable: false })
  @MinLength(2)
  @MaxLength(16)
  @Column({ type: DataType.STRING })
  lastName: string;

  @Field({ nullable: false })
  @IsEmail()
  @Column({ type: DataType.STRING })
  email: string;

  @Field({ nullable: false })
  @MinLength(6)
  @IsStrongPassword()
  @Column({ type: DataType.STRING })
  password: string;
}

@InputType()
@ObjectType()
export class ProfileInput {
  @Field({ nullable: true })
  @MinLength(2)
  @MaxLength(16)
  @Column({ type: DataType.STRING })
  firstName: string;

  @Field({ nullable: true })
  @MinLength(2)
  @MaxLength(16)
  @Column({ type: DataType.STRING })
  lastName: string;
  @Field({ nullable: true })
  @IsUrl({}, { message: "Invalid URL format for avatar" })
  @Column({ type: DataType.STRING })
  avatar: string;

  @Field({ nullable: true })
  @IsPhoneNumber(null, { message: "Invalid phone number" })
  @Length(1, 15, {
    message: "Phone number must be between 1 and 15 characters"
  })
  @Column({ type: DataType.STRING })
  phoneNumber: string;

  @Field({ nullable: true })
  @Length(1, 255, { message: "Bio must be between 1 and 255 characters" })
  @Column({ type: DataType.STRING })
  bio: string;
}

export enum TokenType {
  "Access" = "Access",
  "Refresh" = "Refresh",
  "Verification" = "Verification",
  "Reset" = "Reset",
  "Invitation" = "Invitation"
}
