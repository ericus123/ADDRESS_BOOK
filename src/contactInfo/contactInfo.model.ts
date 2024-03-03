import { Field, ID, InputType, ObjectType } from "@nestjs/graphql";
import { UUIDV4 } from "sequelize";
import {
  BelongsTo,
  Column,
  DataType,
  Default,
  ForeignKey,
  Index,
  Model,
  PrimaryKey,
  Table
} from "sequelize-typescript";
import { v4 as uuidv4 } from "uuid";
import { Contact } from "../contact/contact.model";

@ObjectType()
@InputType("IContactInfo")
@Table({
  timestamps: true,
  tableName: "ContactInfo",
  omitNull: true,
  paranoid: true
})
export class ContactInfo extends Model<ContactInfo> {
  @Field((type) => ID)
  @Index
  @PrimaryKey
  @Default(UUIDV4)
  @Column({ type: DataType.STRING })
  id?: string = uuidv4();

  @Field()
  @Column({ type: DataType.STRING, allowNull: false })
  infoType: "email" | "phone";

  @Field()
  @Column({ type: DataType.STRING, allowNull: false })
  value: string;

  @Field({ nullable: true })
  @ForeignKey(() => Contact)
  @Column({ type: DataType.STRING, allowNull: true })
  contactId?: string;

  @Field(() => Contact, { nullable: true })
  @BelongsTo(() => Contact)
  contact?: Contact;
}
