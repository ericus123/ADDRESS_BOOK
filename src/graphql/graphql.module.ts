import { ApolloDriver, ApolloDriverConfig } from "@nestjs/apollo";
import { Module } from "@nestjs/common";
import { GraphQLModule } from "@nestjs/graphql";
import { AuthModule } from "../auth/auth.module";
import { AuthResolver } from "../auth/auth.resolver";
import { ContactModule } from "../contact/contact.module";
import { ContactResolver } from "../contact/contact.resolver";
import { ContactInfoResolver } from "../contactInfo/contactInfo.resolver";
import { ContactInfoModule } from "../contactInfo/contactInfoModule";
import { JwtModule } from "../jwt/jwt.module";
import { UserModule } from "../user/user.module";

@Module({
  imports: [
    UserModule,
    JwtModule,
    AuthModule,
    ContactModule,
    ContactInfoModule,
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: "src/graphql/schema.gql",
      sortSchema: true
    })
  ],
  providers: [AuthResolver, ContactResolver, ContactInfoResolver]
})
export class GraphqlModule {}
