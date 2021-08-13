import { config } from 'dotenv';
import { ConnectionOptions } from 'typeorm';
import * as path from 'path';
import { Keyword, User, UserKeyword } from './user/user.entity';
import { Notice, UserNotice, File } from './notice/notice.entity';
import {
  Department,
  NoticeTag,
  Tag,
  UserTag,
} from './department/department.entity';
import { getEnvFile } from './functions/custom-function';

const envFile = getEnvFile();
config({ path: path.resolve(process.cwd(), envFile) });

const ormConfig: ConnectionOptions = {
  type: 'mariadb',
  host: process.env.DATABASE_HOST,
  port: +(process.env.DATABASE_PORT ?? 3306),
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
    UserKeyword,
  ],
  //need to be set false when production
  synchronize: false,
  migrations: ['dist/migration/*.js'],
  migrationsRun: true,
  cli: {
    migrationsDir: 'src/migration',
  },
};

export = ormConfig;
