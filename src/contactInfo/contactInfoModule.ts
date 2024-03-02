import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { ContactInfo } from "./contactInfo.model";
import { ContactInfoService } from "./contactInfo.service";

@Module({
  imports: [SequelizeModule.forFeature([ContactInfo])],
  providers: [ContactInfoService],
  exports: [ContactInfoService]
})
export class ContactInfoModule {}
