import { ConfigService } from "@nestjs/config";
import { SequelizeModuleOptions } from "@nestjs/sequelize";

export const databaseConfigs = {
  development: (configService: ConfigService): SequelizeModuleOptions => ({
    uri: configService.get<string>("DEV_DB_URI")
  }),
  staging: (configService: ConfigService) => ({
    uri: configService.get<string>("DEV_DB_URI")
  }),
  production: (configService: ConfigService) => ({
    uri: configService.get<string>("DEV_DB_URI")
  })
};
