import { IsString, Validate } from 'class-validator';
import {
  UniqueEmailValidator,
  UniqueUsernameValidator,
} from '../user.validator';

export class CreateUserDto {
  @IsString()
  @Validate(UniqueUsernameValidator)
  readonly username!: string;

  @IsString()
  readonly password!: string;

  @IsString()
  @Validate(UniqueEmailValidator)
  readonly email!: string;
}
