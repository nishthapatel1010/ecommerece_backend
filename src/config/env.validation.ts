import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  
  // Production DB
  DATABASE_URL: Joi.string().optional(),
  DB_URL: Joi.string().optional(),

  // Development DB
  DB_HOST: Joi.string().when('NODE_ENV', {
    is: 'development',
    then: Joi.required(),
  }),
  DB_PORT: Joi.number().when('NODE_ENV', {
    is: 'development',
    then: Joi.required(),
  }),
  DB_USERNAME: Joi.string().when('NODE_ENV', {
    is: 'development',
    then: Joi.required(),
  }),
  DB_PASSWORD: Joi.string().when('NODE_ENV', {
    is: 'development',
    then: Joi.required(),
  }),
  DB_NAME: Joi.string().when('NODE_ENV', {
    is: 'development',
    then: Joi.required(),
  }),

  // Cloudinary
  CLOUDINARY_CLOUD_NAME: Joi.string().required(),
  CLOUDINARY_API_KEY: Joi.string().required(),
  CLOUDINARY_API_SECRET: Joi.string().required(),
});
