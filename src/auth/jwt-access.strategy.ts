import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { Payload } from '../types/custom-type';
import { User } from '../user/user.entity';

@Injectable()
export class JwtAccessStrategy extends PassportStrategy(Strategy, 'jwt-access') {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: process.env.ACCESS_SECRET,
        });
    }

    async validate(payload: Payload): Promise<User> {
        const user: User | null = await User.findOne({ where: { id: payload.id } });
        if (!user) throw new UnauthorizedException();
        return user;
    }
}
