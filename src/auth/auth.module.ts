import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { AuthService } from './auth.service';
import { JwtAccessStrategy } from './jwt-access.strategy';
import { JwtRefreshStrategy } from './jwt-refresh.strategy';

@Module({
    imports: [PassportModule, JwtModule.register({})],
    providers: [AuthService, JwtAccessStrategy, JwtRefreshStrategy],
    exports: [AuthService],
})
export class AuthModule {}
