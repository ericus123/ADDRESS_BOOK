import { Field, InputType, ObjectType } from "@nestjs/graphql";
import { IsNotEmpty, MaxLength, MinLength } from "class-validator";
import { ContactInfo } from "../contactInfo/contactInfo.model";

@InputType()
@ObjectType()
export class ContactInput {
  @Field()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(50)
  firstName: string;

  @Field()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(50)
  lastName: string;

  @Field(() => [ContactInfo])
  contactInfos?: ContactInfo[];
}
