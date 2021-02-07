import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { DepartmentModule } from './department/department.module';
import { NoticeModule } from './notice/notice.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Keyword, User } from './user/user.entity';
import { UserNotice, File, Notice } from './notice/notice.entity';
import {
  Department,
  NoticeTag,
  Tag,
  UserTag,
} from './department/department.entity';

const ENV: string = process.env.NODE_ENV;

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [ENV === 'prod' ? '.env.prod' : '.env.dev', '.env.ci'],
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DATABASE_HOST,
      port: +process.env.DATABASE_PORT,
      username: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_DBNAME,
      entities: [
        User,
        Keyword,
        UserNotice,
        File,
        Notice,
        UserTag,
        Tag,
        Department,
        NoticeTag,
      ],
      //need to be set false when production
      synchronize: true,
    }),
    UserModule,
    DepartmentModule,
    NoticeModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
