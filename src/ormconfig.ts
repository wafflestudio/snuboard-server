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

const ENV: string = process.env.NODE_ENV ?? 'dev';
let envFile: string;
if (ENV === 'production') {
  envFile = '.env.prod';
} else if (ENV === 'ci') {
  envFile = '.env.ci';
} else {
  envFile = '.env.dev';
}

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
  migrationsRun: false,
  cli: {
    migrationsDir: 'src/migration',
  },
};

export = ormConfig;
