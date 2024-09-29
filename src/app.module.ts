import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { DepartmentModule } from './department/department.module';
import { FirebaseModule } from './firebase/firebase.module';
import { getEnvFile } from './functions/custom-function';
import { NoticeModule } from './notice/notice.module';
import ormConfig from './ormconfig';
import { UserModule } from './user/user.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: [getEnvFile()],
        }),
        TypeOrmModule.forRoot(ormConfig),
        UserModule,
        DepartmentModule,
        NoticeModule,
        AuthModule,
        FirebaseModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
