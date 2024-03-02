import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { ContactInfoModule } from "../contactInfo/contactInfoModule";
import { UserModule } from "../user/user.module";
import { Contact } from "./contact.model";
import { ContactService } from "./contact.service";

@Module({
  imports: [
    SequelizeModule.forFeature([Contact]),
    UserModule,
    ContactInfoModule
  ],
  providers: [ContactService],
  exports: [ContactService]
})
export class ContactModule {}
