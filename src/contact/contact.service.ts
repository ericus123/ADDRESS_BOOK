import { Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { ContactInfo } from "../contactInfo/contactInfo.model";
import { ContactInfoService } from "../contactInfo/contactInfo.service";
import { UserService } from "../user/user.service";
import { Contact } from "./contact.model";
import { ContactInput } from "./contact.types";

@Injectable()
export class ContactService {
  logger = new Logger("ContactService");
  constructor(
    @InjectModel(Contact)
    private readonly contactModel: typeof Contact,
    private readonly userService: UserService,
    private readonly contactInfoService: ContactInfoService
  ) {}

  async getContacts(email: string): Promise<Contact[]> {
    try {
      const user = await this.userService.getUser({
        type: "EMAIL",
        value: email
      });

      return await this.contactModel.findAll({
        where: {
          userId: user.id
        },
        include: [
          {
            model: ContactInfo,
            attributes: ["infoType", "value", "contactId"]
          }
        ]
      });
    } catch (error) {
      throw new Error(error);
    }
  }

  async createContact(input: ContactInput, email: string): Promise<Contact> {
    try {
      const user = await this.userService.getUser({
        type: "EMAIL",
        value: email
      });
      const contact = await new this.contactModel({
        ...input,
        userId: user.id
      }).save();

      //save contact info if they were provided by user
      if (input?.contactInfos != undefined && input.contactInfos.length) {
        await Promise.all(
          input.contactInfos?.map(
            async (info) =>
              await this.contactInfoService.createContactInfo(contact.id, info)
          )
        );
        this.logger.debug("Saved contact information");
      }

      return contact;
    } catch (error) {
      throw new Error(error);
    }
  }

  async updateContact({
    id,
    input,
    email
  }: {
    id: string;
    input: ContactInput;
    email: string;
  }): Promise<Contact> {
    try {
      const contact = await this.getContact({ id, email });

      if (contact) {
        return contact.update(input);
      }
    } catch (error) {
      throw new Error(error);
    }
  }

  async deleteContact({
    id,
    email
  }: {
    id: string;
    email: string;
  }): Promise<boolean> {
    try {
      const contact = await this.getContact({ id, email });

      if (contact) {
        await contact.destroy();
        this.logger.debug("Contact deleted");
        return true;
      }

      return true;
    } catch (error) {
      throw new Error(error);
    }
  }

  async getContact({
    id,
    email
  }: {
    id: string;
    email: string;
  }): Promise<Contact> {
    const user = await this.userService.getUser({
      type: "EMAIL",
      value: email
    });

    const contact = await this.contactModel.findOne({
      where: {
        id,
        userId: user.id
      },
      include: [
        {
          model: ContactInfo,
          attributes: ["infoType", "value", "contactId"]
        }
      ]
    });

    return contact;
  }
  async getDuplicates({
    contactId,
    email
  }: {
    contactId: string;
    email: string;
  }): Promise<Contact[]> {
    try {
      const contact = await this.getContact({ id: contactId, email });
      if (contact) {
        const duplicates = await this.contactModel.findAll({
          where: {
            firstName: contact.firstName,
            lastName: contact.lastName
          },
          include: [
            {
              model: ContactInfo,
              attributes: ["infoType", "value", "contactId"]
            }
          ]
        });

        return duplicates;
      }
    } catch (error) {
      throw new Error(error);
    }
  }

  async mergeDuplicates({
    contactId,
    email
  }: {
    contactId: string;
    email: string;
  }) {
    try {
      const contact = await this.getContact({ id: contactId, email });

      if (contact) {
        const duplicates = await this.getDuplicates({ contactId, email });

        const infos: ContactInfo[] = [];
        duplicates?.forEach((duplicate) => {
          infos.push(...duplicate.contactInfos);
        });

        //merging and removing duplicate contact info
        infos.map(async (i) => {
          if (!this.isDuplicate(infos, i)) {
            await this.contactInfoService.updateContactInfo(i.id, {
              contactId: contact.id
            });
          } else {
            await this.contactInfoService.deleteContactInfo(i.id);
          }
        });

        this.logger.debug(duplicates.filter((dup) => dup.id !== contactId));

        //removing possible duplicates and only keping one contact
        duplicates
          .filter((dup) => dup.id !== contactId)
          .map(async (cont) => {
            await this.deleteContact({ id: cont.id, email });
          });
      }
    } catch (error) {
      throw new Error(error);
    }
  }

  isDuplicate(infos: ContactInfo[], info: ContactInfo): boolean {
    return infos.some((i) => i.value === info.value);
  }

  async updateContacts(ids: string[], input: Contact): Promise<Contact[]> {
    try {
      const contacts = await this.contactModel.findAll({
        where: { id: ids }
      });
      if (!contacts || contacts.length === 0) {
        this.logger.debug("Contacts not found");
      } else {
        const updatedContacts = await Promise.all(
          contacts.map((contact) => contact.update(input))
        );
        this.logger.debug("Updated multiple contacts");
        return updatedContacts;
      }
    } catch (error) {
      throw new Error(error);
    }
  }
}
