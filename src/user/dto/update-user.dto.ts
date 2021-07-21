import { CreateUserDto } from './create-user.dto';
import { PartialType, PickType } from '@nestjs/mapped-types';
import { IsOptional, IsString, Validate } from 'class-validator';
import { UniqueEmailValidator } from '../user.validator';

export class UpdateUserDto {
  @IsOptional()
  @Validate(UniqueEmailValidator)
  @IsString()
  email!: string;

  @IsOptional()
  @IsString()
  password!: string;
}
