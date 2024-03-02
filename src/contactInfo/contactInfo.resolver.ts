import { UseGuards } from "@nestjs/common";
import { Args, Mutation, Resolver } from "@nestjs/graphql";
import { AuthGuard } from "../auth/auth.guard";
import { ContactInfo } from "./contactInfo.model";
import { ContactInfoService } from "./contactInfo.service";

@Resolver(() => ContactInfo)
@UseGuards(AuthGuard)
export class ContactInfoResolver {
  constructor(private readonly contactInfoService: ContactInfoService) {}

  @Mutation(() => ContactInfo)
  async createContactInfo(
    @Args("contactId") contactId: string,
    @Args("input") input: ContactInfo
  ): Promise<ContactInfo> {
    return this.contactInfoService.createContactInfo(contactId, input);
  }

  @Mutation(() => ContactInfo)
  async updateContactInfo(
    @Args("id") id: string,
    @Args("input") input: ContactInfo
  ): Promise<ContactInfo> {
    return this.contactInfoService.updateContactInfo(id, input);
  }

  @Mutation(() => Boolean)
  async deleteContactInfo(@Args("id") id: string): Promise<boolean> {
    return this.contactInfoService.deleteContactInfo(id);
  }
}
