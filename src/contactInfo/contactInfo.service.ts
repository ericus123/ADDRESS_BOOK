import { Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { assignUUID } from "../helpers";
import { ContactInfo } from "./contactInfo.model";

@Injectable()
export class ContactInfoService {
  logger = new Logger("ContactInfoService");
  constructor(
    @InjectModel(ContactInfo)
    private readonly contactInfoModel: typeof ContactInfo
  ) {}

  async createContactInfo(
    contactId: string,
    input: Partial<ContactInfo>
  ): Promise<ContactInfo> {
    try {
      const contactInfo = new this.contactInfoModel(
        assignUUID({
          ...input,
          contactId
        })
      );
      return contactInfo.save();
    } catch (error) {
      throw new Error(error);
    }
  }

  async getContactInfo(id: string): Promise<ContactInfo> {
    const contactInfo = await this.contactInfoModel.findByPk(id, {});
    return contactInfo;
  }

  async updateContactInfo(
    id: string,
    input: Partial<ContactInfo>
  ): Promise<ContactInfo> {
    try {
      const contactInfo = await this.getContactInfo(id);
      if (contactInfo) {
        this.logger.debug("Contact info updated");
        return contactInfo.update(input);
      }
    } catch (error) {
      throw new Error(error);
    }
  }

  async deleteContactInfo(id: string): Promise<boolean> {
    try {
      const contactInfo = await this.getContactInfo(id);

      if (contactInfo) {
        await contactInfo.destroy();
        return true;
      }
    } catch (error) {
      throw new Error(error);
    }
  }
}
