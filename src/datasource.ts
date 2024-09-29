import { DataSource, DataSourceOptions } from 'typeorm';

import * as dataSourceOptions from './ormconfig.js';

export const dataSource = new DataSource(dataSourceOptions as DataSourceOptions);
