import { IsString, Validate } from 'class-validator';
import { UniqueUsernameValidator } from '../user.validator';

export class CreateUserDto {
  @IsString()
  @Validate(UniqueUsernameValidator)
  readonly username!: string;

  @IsString()
  readonly password!: string;

  @IsString()
  readonly email!: string;
}
