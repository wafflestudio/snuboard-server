import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './user.entity';

@Injectable()
export class UserService {
  create(userData: CreateUserDto): Promise<User> {
    return User.save(new User(userData));
  }
}
