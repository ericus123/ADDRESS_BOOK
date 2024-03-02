import { UseGuards } from "@nestjs/common";
import { Args, Context, Mutation, Query, Resolver } from "@nestjs/graphql";
import { AuthGuard } from "../auth/auth.guard";
import { Contact } from "./contact.model";
import { ContactService } from "./contact.service";
import { ContactInput } from "./contact.types";

@Resolver(() => Contact)
@UseGuards(AuthGuard)
export class ContactResolver {
  constructor(private readonly contactService: ContactService) {}

  @Query(() => Contact, { name: "contact" })
  async getContact(@Args("id") id: string): Promise<Contact> {
    return this.contactService.getContact(id);
  }
  @Query(() => [Contact], { name: "contacts" })
  async getContacts(@Args("id") id: string): Promise<Contact[]> {
    return this.contactService.getContacts(id);
  }

  @Query((returns) => [Contact], { name: "getDuplicates" })
  async getDuplicates(
    @Args("contactId") contactId: string
  ): Promise<Contact[]> {
    return this.contactService.getDuplicates(contactId);
  }

  @Mutation((returns) => Boolean, { name: "mergeDuplicates" })
  async mergeDuplicates(
    @Args("contactId") contactId: string
  ): Promise<boolean> {
    await this.contactService.mergeDuplicates(contactId);
    return true;
  }

  @Mutation(() => Contact)
  async createContact(
    @Args("input") input: ContactInput,
    @Context() context: any
  ): Promise<Contact> {
    const { userEmail } = context.req;
    return this.contactService.createContact(input, "amanericus@gmail.com");
  }

  @Mutation(() => Contact)
  async updateContact(
    @Args("id") id: string,
    @Args("input") input: ContactInput
  ): Promise<Contact> {
    return this.contactService.updateContact(id, input);
  }

  @Mutation(() => Boolean)
  async deleteContact(@Args("id") id: string): Promise<boolean> {
    return this.contactService.deleteContact(id);
  }

  @Mutation(() => [Contact])
  async updateContacts(
    @Args("ids", { type: () => [String] }) ids: string[],
    @Args("input") input: Contact
  ): Promise<Contact[]> {
    return this.contactService.updateContacts(ids, input);
  }
}
