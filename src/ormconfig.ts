import * as path from 'path';

import { config } from 'dotenv';
import { DataSourceOptions } from 'typeorm';

import { Department, NoticeTag, Tag, UserTag } from './department/department.entity';
import { getEnvFile } from './functions/custom-function';
import { Notice, UserNotice, File } from './notice/notice.entity';
import { User } from './user/user.entity';

const envFile = getEnvFile();
config({ path: path.resolve(process.cwd(), envFile) });

const ormConfig: DataSourceOptions = {
    type: 'mysql',
    host: process.env.DATABASE_HOST,
    port: +(process.env.DATABASE_PORT ?? 3306),
    username: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_DBNAME,
    entities: [User, UserNotice, File, Notice, UserTag, Tag, Department, NoticeTag],
    // need to be set false when production
    synchronize: false,
    migrations: ['dist/migration/*.js'],
    migrationsRun: true,
    // @ts-ignore
    cli: {
        migrationsDir: 'src/migration',
    },
};

export = ormConfig;
