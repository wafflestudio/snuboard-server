import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { Payload } from '../types/custom-type';
import { User } from '../user/user.entity';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: process.env.REFRESH_SECRET,
            passReqToCallback: true,
        });
    }

    async validate(request: Request, payload: Payload): Promise<User> {
        if (!request.headers.authorization) throw new UnauthorizedException();
        const refreshToken: string = request.headers.authorization.replace('Bearer ', '');
        const user: User | undefined = await User.findOneIfRefreshTokenMatches(refreshToken, payload.id);
        if (!user) throw new UnauthorizedException();
        return user;
    }
}
