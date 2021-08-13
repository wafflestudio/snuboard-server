import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { AuthDto } from './dto/auth-user.dto';
import { UserRequest } from '../types/custom-type';
import { KeywordDto } from './dto/keyword.dto';
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

  @UseGuards(JwtAccessGuard)
  @Patch('me')
  async update(
    @Req() req: UserRequest,
    @Body() userData: UpdateUserDto,
  ): Promise<User | undefined> {
    return await this.userService.update(req, userData);
  }

  @UseGuards(JwtAccessGuard)
  @Delete('me')
  async delete(@Req() req: UserRequest): Promise<User> {
    return await this.userService.delete(req);
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
  @Post('me/keyword')
  async createKeyword(
    @Req() req: UserRequest,
    @Body() keywordData: KeywordDto,
  ): Promise<User> {
    return await this.userService.createKeyword(req, keywordData);
  }

  @UseGuards(JwtAccessGuard)
  @Delete('me/keyword')
  async deleteKeyword(
    @Req() req: UserRequest,
    @Body() keyword: KeywordDto,
  ): Promise<User> {
    return await this.userService.deleteKeyword(req, keyword);
  }

  @UseGuards(JwtAccessGuard)
  @Post('me/fcm/topics')
  async subscribeFcmTopic(
    @Req() req: UserRequest,
    @Body() tokenData: FcmTopicDto,
  ) {
    return await this.userService.createSubscriptionToFcmTopics(req, tokenData);
  }

  @UseGuards(JwtAccessGuard)
  @Delete('me/fcm/topics')
  async unsubscribeFcmTopic(
    @Req() req: UserRequest,
    @Body() tokenData: FcmTopicDto,
  ) {
    return await this.userService.deleteSubscriptionFromFcmTopics(
      req,
      tokenData,
    );
  }
}
