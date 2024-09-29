import { DataSource, DataSourceOptions } from 'typeorm';

import dataSourceOptions from './ormconfig.js';

export const dataSource = new DataSource(dataSourceOptions as DataSourceOptions);
