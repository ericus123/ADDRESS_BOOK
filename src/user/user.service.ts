import { Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { v4 as uuidv4 } from "uuid";
import HashingService from "../crypto/hashing.service";
import { User } from "./user.model";

import { GetUserInput, SignupInput } from "./user.types";

@Injectable()
export class UserService {
  logger = new Logger("User Service");
  constructor(
    @InjectModel(User)
    private readonly userModel: typeof User,
    private readonly hashingService: HashingService
  ) {}

  async addUser(input: SignupInput): Promise<User> {
    try {
      input.password = await this.hashingService.hash(input.password);

      const user = await this.userModel.create({
        ...input,
        username: `${input.firstName}_${uuidv4(5)}`
      });
      await user.save();
      return user;
    } catch (error) {
      throw new Error(error);
    }
  }

  async getUser({ type, value }: GetUserInput): Promise<User> {
    try {
      if (type === "EMAIL") {
        const user = await this.userModel.findOne({
          where: {
            email: value
          }
        });

        return user;
      }

      if (type === "ID") {
        const user = await this.userModel.findByPk(value);
        return user;
      }
    } catch (error) {
      throw new Error(error);
    }
  }
}
