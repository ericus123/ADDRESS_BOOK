import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform
} from "@nestjs/common";
import { plainToClass } from "class-transformer";
import { validate } from "class-validator";
import { AuthErrors } from "../auth/constants";

@Injectable()
export class ValidationPipe implements PipeTransform<any> {
  async transform(value: any, metadata: ArgumentMetadata): Promise<any> {
    const { metatype } = metadata;

    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }

    const object = plainToClass(metatype, value);
    const errors = await validate(object);

    if (errors.length > 0) {
      throw new BadRequestException(AuthErrors.INVALID_INPUT);
    }

    return value;
  }

  private toValidate(metatype: any): boolean {
    const types = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }
}
