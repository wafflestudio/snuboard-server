import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from './auth.service';
import { User } from '../user/user.entity';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super();
  }

  async validate(username: string, password: string): Promise<User> {
    const user: User | undefined = await this.authService.validateUser(
      username,
      password,
    );
    if (!user) {
      throw new UnauthorizedException('아이디 혹은 비밀번호가 잘못되었습니다.');
    }
    return user;
  }
}
