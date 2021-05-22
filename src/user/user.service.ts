import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { Keyword, User, UserKeyword } from './user.entity';
import { AuthService } from '../auth/auth.service';
import { UserRequest } from '../types/custom-type';
import { UpdateUserDto } from './dto/update-user.dto';
import { KeywordDto } from './dto/keyword.dto';
import * as bcrypt from 'bcrypt';
import { DeleteResult } from 'typeorm';

@Injectable()
export class UserService {
  constructor(private authService: AuthService) {}

  async create(userData: CreateUserDto): Promise<User> {
    const user: User = User.create(userData);
    user.password = await bcrypt.hash(user.password, +process.env.SALT_ROUND!);
    await User.save(user);
    return this.authService.login(user);
  }

  async auth(req: UserRequest): Promise<User> {
    return await this.authService.login(req.user);
  }

  async getUserMe(req: UserRequest): Promise<User | undefined> {
    return await User.findOneWithKeyword({ id: req.user.id });
  }
  // 에러처리 필요
  async delete(req: UserRequest): Promise<User> {
    const user = await User.findOneWithKeyword({ id: req.user.id });
    if (user === undefined)
      throw new UnauthorizedException('not authorized user cannot be deleted');
    return await User.remove(user);
  }

  async update(
    req: UserRequest,
    userData: UpdateUserDto,
  ): Promise<User | undefined> {
    if (userData.password) {
      userData.password = await bcrypt.hash(
        userData.password,
        +process.env.SALT_ROUND!,
      );
    }
    if (Object.keys(userData).length != 0) {
      await User.update(req.user, userData);
    }
    return User.findOneWithKeyword({ id: req.user.id });
  }

  async createKeyword(
    req: UserRequest,
    keywordData: KeywordDto,
  ): Promise<User> {
    let keyword: Keyword | undefined = await Keyword.findOne({
      name: keywordData.keyword,
    });
    if (keyword) {
      const userKeyword: UserKeyword | undefined = await UserKeyword.findOne({
        user: req.user,
        keyword,
      });
      if (userKeyword)
        throw new BadRequestException('keyword already added to this user');
    } else {
      keyword = Keyword.create({ name: keywordData.keyword });
      await Keyword.save(keyword);
    }

    const userKeyword: UserKeyword = UserKeyword.create({
      user: req.user,
      keyword,
    });
    await UserKeyword.save(userKeyword);
    const user: User | undefined = await User.findOneWithKeyword({
      id: req.user.id,
    });
    if (!user) throw new BadRequestException();
    return user;
  }

  async deleteKeyword(
    req: UserRequest,
    keywordData: KeywordDto,
  ): Promise<User> {
    let keyword: Keyword | undefined = await Keyword.findOne({
      name: keywordData.keyword,
    });

    if (!keyword) throw new BadRequestException();

    const userKeyword: UserKeyword | undefined = keyword
      ? await UserKeyword.findOne({
          user: req.user,
          keyword: keyword,
        })
      : undefined;

    if (!userKeyword) {
      throw new HttpException(
        {
          message: 'already deleted',
        },
        HttpStatus.NO_CONTENT,
      );
    }
    await UserKeyword.delete(userKeyword.id);
    keyword = await Keyword.findOne(keyword.id);
    if (
      keyword &&
      !(await UserKeyword.findOne({
        keyword,
      }))
    ) {
      await Keyword.delete(keyword);
    }

    const user: User | undefined = await User.findOneWithKeyword({
      id: req.user.id,
    });
    if (!user) throw ForbiddenException;

    return user;
  }
}
