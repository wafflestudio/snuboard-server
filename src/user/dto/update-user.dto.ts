import { CreateUserDto } from './create-user.dto';
import { PartialType, PickType } from '@nestjs/mapped-types';
import { IsOptional, IsString, Validate } from 'class-validator';
import { UniqueNicknameValidator } from '../user.validator';

export class UpdateUserDto {
  @IsOptional()
  @Validate(UniqueNicknameValidator)
  @IsString()
  nickname: string;

  @IsOptional()
  @IsString()
  password: string;
}
