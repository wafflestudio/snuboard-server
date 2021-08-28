import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { AuthDto } from './dto/auth-user.dto';
import { UserRequest } from '../types/custom-type';
import { AuthTokenGuard, JwtAccessGuard } from '../auth/auth.guard';
import { FcmTopicDto } from './dto/fcm-topic.dto';

@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @UseGuards(JwtAccessGuard)
  @Get('me')
  getUserMe(@Req() req: UserRequest) {
    return this.userService.getUserMe(req);
  }

  @Post()
  async create(@Body() userData: CreateUserDto): Promise<User> {
    return this.userService.create(userData);
  }

  @HttpCode(200)
  @UseGuards(AuthTokenGuard)
  @Post('auth/token')
  async auth(
    @Body() authData: AuthDto,
    @Req() req: UserRequest,
  ): Promise<User> {
    return await this.userService.auth(req);
  }

  @UseGuards(JwtAccessGuard)
  @Post('me/fcm/topics')
  async createSubscriptionToFcmTopics(
    @Req() req: UserRequest,
    @Body() tokenData: FcmTopicDto,
  ) {
    return await this.userService.createSubscriptionToFcmTopics(req, tokenData);
  }

  @UseGuards(JwtAccessGuard)
  @Delete('me/fcm/topics')
  async deleteSubscriptionFromFcmTopics(
    @Req() req: UserRequest,
    @Body() tokenData: FcmTopicDto,
  ) {
    return await this.userService.deleteSubscriptionFromFcmTopics(
      req,
      tokenData,
    );
  }
}
