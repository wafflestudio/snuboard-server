import { IsString, Validate } from 'class-validator';
import {
  UniqueNicknameValidator,
  UniqueUsernameValidator,
} from '../user.validator';

export class CreateUserDto {
  @IsString()
  @Validate(UniqueUsernameValidator)
  readonly username!: string;

  @IsString()
  readonly password!: string;

  @IsString()
  @Validate(UniqueNicknameValidator)
  readonly nickname!: string;
}
