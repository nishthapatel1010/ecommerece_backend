import 'dotenv/config';

export const env = {
  // App
  PORT: parseInt(process.env.PORT ?? '8000', 10),
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  AUTO_APPROVE_BUYERS: process.env.AUTO_APPROVE_BUYERS === 'true',

  // Database
  DB_HOST: process.env.DB_HOST ?? '',
  DB_PORT: parseInt(process.env.DB_PORT ?? '5432', 10),
  DB_USERNAME: process.env.DB_USERNAME ?? '',
  DB_PASSWORD: process.env.DB_PASSWORD ?? '',
  DB_NAME: process.env.DB_NAME ?? '',

  // JWT
  JWT_SECRET: process.env.JWT_SECRET ?? 'secret',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN ?? '15m',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET ?? 'refresh_secret',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',

  // Cloudinary
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME ?? '',
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY ?? '',
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET ?? '',
} as const;
