import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './user.entity';
import { AuthService } from '../auth/auth.service';
import { UserRequest } from '../types/custom-type';
import { FcmTopicDto } from './dto/fcm-topic.dto';
import { FirebaseService } from '../firebase/firebase.service';

@Injectable()
export class UserService {
  constructor(
    private authService: AuthService,
    private firebaseService: FirebaseService,
  ) {}

  async create(userData: CreateUserDto): Promise<User> {
    const user: User = User.create({
      username: userData.token,
      email: '',
    });
    await User.save(user);
    return this.authService.login(user);
  }

  async auth(req: UserRequest): Promise<User> {
    return await this.authService.login(req.user);
  }

  async getUserMe(req: UserRequest): Promise<User | undefined> {
    return await User.findOne({ id: req.user.id });
  }

  async createSubscriptionToFcmTopics(
    req: UserRequest,
    tokenData: FcmTopicDto,
  ) {
    const token = tokenData.token;

    return await this.firebaseService.createUserSubscription(req.user, token);
  }

  async deleteSubscriptionFromFcmTopics(
    req: UserRequest,
    tokenData: FcmTopicDto,
  ) {
    const token = tokenData.token;

    return await this.firebaseService.deleteUserSubscription(req.user, token);
  }
}
