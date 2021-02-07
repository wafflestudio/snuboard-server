import { PartialType, PickType } from '@nestjs/graphql';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(
  PickType(CreateUserDto, ['nickname']),
) {}
