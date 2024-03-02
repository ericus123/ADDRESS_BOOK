import { ApolloDriver, ApolloDriverConfig } from "@nestjs/apollo";
import { Module } from "@nestjs/common";
import { GraphQLModule } from "@nestjs/graphql";
import { AuthModule } from "../auth/auth.module";
import { AuthResolver } from "../auth/auth.resolver";
import { JwtModule } from "../jwt/jwt.module";
import { RoleModule } from "../role/role.module";
import { RoleResolver } from "../role/role.resolver";
import { UserModule } from "../user/user.module";
import { UserResolver } from "../user/user.resolver";

@Module({
  imports: [
    UserModule,
    JwtModule,
    RoleModule,
    AuthModule,
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: "src/graphql/schema.gql",
      sortSchema: true
    })
  ],
  providers: [UserResolver, AuthResolver, RoleResolver]
})
export class GraphqlModule {}
