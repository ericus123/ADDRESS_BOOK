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
  async getContact(
    @Args("id") id: string,
    @Context() context: any
  ): Promise<Contact> {
    const { userEmail } = context.req;
    return this.contactService.getContact({ id, email: userEmail });
  }
  @Query(() => [Contact], { name: "contacts" })
  async getContacts(@Context() context: any): Promise<Contact[]> {
    const { userEmail } = context.req;
    return this.contactService.getContacts(userEmail);
  }

  @Query((returns) => [Contact], { name: "getDuplicates" })
  async getDuplicates(
    @Args("contactId") contactId: string,
    @Context() context: any
  ): Promise<Contact[]> {
    const { userEmail } = context.req;
    return this.contactService.getDuplicates({ contactId, email: userEmail });
  }

  @Mutation((returns) => Boolean, { name: "mergeDuplicates" })
  async mergeDuplicates(
    @Args("contactId") contactId: string,
    @Context() context: any
  ): Promise<boolean> {
    const { userEmail } = context.req;
    await this.contactService.mergeDuplicates({ contactId, email: userEmail });
    return true;
  }

  @Mutation(() => Contact)
  async createContact(
    @Args("input") input: ContactInput,
    @Context() context: any
  ): Promise<Contact> {
    const { userEmail } = context.req;
    return this.contactService.createContact(input, userEmail);
  }

  @Mutation(() => Contact)
  async updateContact(
    @Args("id") id: string,
    @Args("input") input: ContactInput,
    @Context() context: any
  ): Promise<Contact> {
    const { userEmail } = context.req;
    return this.contactService.updateContact({ id, input, email: userEmail });
  }

  @Mutation(() => Boolean)
  async deleteContact(
    @Args("id") id: string,
    @Context() context: any
  ): Promise<boolean> {
    const { userEmail } = context.req;
    return this.contactService.deleteContact({ id, email: userEmail });
  }

  @Mutation(() => [Contact])
  async updateContacts(
    @Args("ids", { type: () => [String] }) ids: string[],
    @Args("input") input: Contact
  ): Promise<Contact[]> {
    return this.contactService.updateContacts(ids, input);
  }
}
