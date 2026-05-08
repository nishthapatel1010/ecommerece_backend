import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const getDatabaseConfig = (configService: ConfigService): TypeOrmModuleOptions => {
  const nodeEnv = configService.get<string>('NODE_ENV');
  const isProduction = nodeEnv === 'production';

  if (isProduction) {
    const databaseUrl = configService.get<string>('DATABASE_URL') || configService.get<string>('DB_URL');
    if (!databaseUrl) {
      throw new Error('DATABASE_URL or DB_URL is missing in production environment');
    }

    const host = databaseUrl.split('@')[1]?.split('/')[0] || 'Remote Server';
    console.log(`Database: Connected to PRODUCTION server at ${host}`);

    return {
      type: 'postgres',
      url: databaseUrl,
      ssl: {
        rejectUnauthorized: false,
      },
      autoLoadEntities: true,
      synchronize: false,
      logging: false,
    };
  }

  // Development Environment
  const host = configService.get<string>('DB_HOST');
  const port = configService.get<number>('DB_PORT');
  const username = configService.get<string>('DB_USERNAME');
  const password = configService.get<string>('DB_PASSWORD');
  const database = configService.get<string>('DB_NAME');

  if (!host || !port || !username || !password || !database) {
    throw new Error('Missing database development credentials');
  }

  console.log(` Database: Connected to DEVELOPMENT server at ${host}:${port}`);

  return {
    type: 'postgres',
    host,
    port: Number(port),
    username,
    password,
    database,
    autoLoadEntities: true,
    synchronize: false,
    logging: true,
  };
};
