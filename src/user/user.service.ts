import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { Keyword, User, UserKeyword } from './user.entity';
import { AuthService } from '../auth/auth.service';
import { UserRequest } from '../types/custom-type';
import { UpdateUserDto } from './dto/update-user.dto';
import { KeywordDto } from './dto/keyword.dto';
import * as bcrypt from 'bcrypt';

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
    return await this.authService.login(req.user!);
  }

  async getUserMe(req: UserRequest): Promise<User | undefined> {
    return await User.findOneWithKeyword({ id: req.user!.id });
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
      await User.update(req.user!, userData);
    }
    return User.findOneWithKeyword({ id: req.user!.id });
  }

  async createKeyword(
    req: UserRequest,
    keywordData: KeywordDto,
  ): Promise<User | undefined> {
    let keyword: Keyword = (await Keyword.findOne({
      name: keywordData.keyword,
    }))!;
    if (keyword) {
      const userKeyword: UserKeyword = (await UserKeyword.findOne({
        user: req.user,
        keyword,
      }))!;
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
    return User.findOneWithKeyword({ id: req.user!.id });
  }

  async deleteKeyword(
    req: UserRequest,
    keywordData: KeywordDto,
  ): Promise<User | undefined> {
    let keyword: Keyword = (await Keyword.findOne({
      name: keywordData.keyword,
    }))!;

    const userKeyword = keyword
      ? await UserKeyword.findOne({
          user: req.user,
          keyword: keyword,
        })
      : null;

    if (!userKeyword) {
      throw new HttpException(
        {
          message: 'already deleted',
        },
        HttpStatus.NO_CONTENT,
      );
    }
    await UserKeyword.delete(userKeyword.id);
    keyword = (await Keyword.findOne(keyword.id))!;
    if (
      keyword &&
      !(await UserKeyword.findOne({
        keyword,
      }))
    ) {
      await Keyword.delete(keyword);
    }

    return User.findOneWithKeyword({ id: req.user!.id });
  }
}
