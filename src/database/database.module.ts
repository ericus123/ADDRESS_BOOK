import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { SequelizeModule } from "@nestjs/sequelize";
import { databaseConfigs } from "../config/database.config";
import { Contact } from "../contact/contact.model";
import { ContactInfo } from "../contactInfo/contactInfo.model";
import { User } from "../user/user.model";

@Module({
  imports: [
    ConfigModule,
    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService?: ConfigService) => ({
        dialect: "postgres",
        uri:
          configService.get<string>("NODE_ENV") === "development"
            ? databaseConfigs.development(configService).uri
            : configService.get<string>("NODE_ENV") === "staging"
            ? databaseConfigs.staging(configService).uri
            : databaseConfigs.production(configService).uri,
        models: [User, Contact, ContactInfo],
        autoLoadModels: true,
        synchronize: process.env.ALTER_TABLES == "true" ? true : false,
        sync: {
          alter: true,
          force: false
        }
      }),
      inject: [ConfigService]
    }),
    SequelizeModule.forFeature([User, ContactInfo])
  ],
  providers: [],
  controllers: []
})
export class DatabaseModule {}
