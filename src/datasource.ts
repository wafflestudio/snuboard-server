import { DataSource } from 'typeorm';

import * as dataSourceOptions from './ormconfig.js';

export const dataSource = new DataSource(dataSourceOptions);
