import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '../user/user.entity';
import { Payload } from '../types/custom-type';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async validateUser(username: string, password: string): Promise<User> {
    const user = await User.findOne({ username });
    if (user && (await bcrypt.compare(password, user.password))) {
      return user;
    }
    return null;
  }

  async login(user: User): Promise<User> {
    const payload: Payload = { username: user.username, id: user.id };

    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.ACCESS_SECRET,
      expiresIn: process.env.ACCESS_EXPIRES_IN,
    });
    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.REFRESH_SECRET,
    });
    user.refreshToken = await bcrypt.hash(
      refreshToken,
      +process.env.SALT_ROUND,
    );
    await User.save(user);
    user = await User.findOneWithKeyword({ id: user.id });
    user.access_token = accessToken;
    user.refresh_token = refreshToken;

    return user;
  }
}
