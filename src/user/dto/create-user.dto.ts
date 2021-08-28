import { IsString, Validate } from 'class-validator';
import { UniqueUsernameValidator } from '../user.validator';

export class CreateUserDto {
  @IsString()
  @Validate(UniqueUsernameValidator)
  readonly token!: string;
}
