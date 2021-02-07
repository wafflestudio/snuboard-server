import { Body, Controller, Get, Patch, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @Get('me')
  getUserMe(): Promise<User> {}

  @Patch('me')
  update(@Body() userData: UpdateUserDto): Promise<User> {}

  @Post()
  create(@Body() userData: CreateUserDto): Promise<User> {
    return this.userService.create(userData);
  }

  @Post('auth/token')
  auth() {}
}
