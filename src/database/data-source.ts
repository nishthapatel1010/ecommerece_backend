import { DataSource, DataSourceOptions } from 'typeorm';
import { env } from '../config/env';

const isProduction = env.NODE_ENV === 'production';

const options: DataSourceOptions = isProduction
  ? {
      type: 'postgres',
      url: process.env.DB_URL || process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      entities: ['src/modules/**/entities/*.entity.ts'],
      migrations: ['src/database/migrations/*.ts'],
    }
  : {
      type: 'postgres',
      host: env.DB_HOST,
      port: env.DB_PORT,
      username: env.DB_USERNAME,
      password: env.DB_PASSWORD,
      database: env.DB_NAME,
      entities: ['src/modules/**/entities/*.entity.ts'],
      migrations: ['src/database/migrations/*.ts'],
    };

export const AppDataSource = new DataSource(options);
