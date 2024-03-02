import { Field, ID, InputType, ObjectType } from "@nestjs/graphql";
import { UUIDV4 } from "sequelize";
import {
  BelongsTo,
  Column,
  DataType,
  Default,
  ForeignKey,
  HasMany,
  Index,
  Model,
  PrimaryKey,
  Table
} from "sequelize-typescript";
import { v4 as uuidv4 } from "uuid";
import { ContactInfo } from "../contactInfo/contactInfo.model";
import { User } from "../user/user.model";

@ObjectType()
@InputType("IContact")
@Table({
  timestamps: true,
  tableName: "Contact",
  omitNull: true,
  paranoid: true
})
export class Contact extends Model<Contact> {
  @Field((type) => ID)
  @Index
  @PrimaryKey
  @Default(UUIDV4)
  @Column({ type: DataType.STRING })
  id?: string = uuidv4();

  @Field()
  @Column({ type: DataType.STRING, allowNull: false })
  firstName: string;

  @Field()
  @Column({ type: DataType.STRING, allowNull: false })
  lastName: string;

  @Field(() => ID, { nullable: true })
  @ForeignKey(() => User)
  @Column({ type: DataType.STRING, allowNull: true })
  userId?: string;

  @Field(() => User, { nullable: true })
  @BelongsTo(() => User)
  user?: User;

  @Field(() => [ContactInfo], { nullable: true })
  @HasMany(() => ContactInfo)
  contactInfos?: ContactInfo[];
}
