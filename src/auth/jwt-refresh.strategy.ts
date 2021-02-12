import { ExtractJwt, Strategy } from 'passport-jwt';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { User } from '../user/user.entity';
import { Payload } from '../types/custom-type';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.REFRESH_SECRET,
      passReqToCallback: true,
    });
  }

  async validate(request: Request, payload: Payload): Promise<User> {
    const refreshToken = request.headers.authorization!.replace('Bearer ', '');
    const user: User = (await User.findOneIfRefreshTokenMatches(
      refreshToken,
      payload.id,
    ))!;
    if (!user) throw new UnauthorizedException();
    return user;
  }
}
