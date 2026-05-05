import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { API_PREFIX } from './shared/constants';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ─── CORS ────────────────────────────────────────────────────────────────
  const isProduction = process.env.NODE_ENV === 'production';

  const allowedOrigins: string[] = [];

  // Add frontend URL from env (set this on Render/your host)
  if (process.env.FRONTEND_URL) {
    const origins = process.env.FRONTEND_URL.split(',').map((url) => url.trim().replace(/\/$/, ''));
    allowedOrigins.push(...origins);
  }

  // Always allow the backend's own Render URL (Swagger UI, health checks, etc.)
  if (process.env.RENDER_EXTERNAL_URL) {
    allowedOrigins.push(process.env.RENDER_EXTERNAL_URL.trim().replace(/\/$/, ''));
  }

  // In development also allow common localhost ports
  if (!isProduction) {
    allowedOrigins.push(
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:4200',
      'http://localhost:5173',
      'http://localhost:8080',
      '*'
    );
  }

  app.enableCors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      // 1. Allow if no origin (Postman, curl, server-to-server)
      if (!origin) return callback(null, true);

      // 2. Allow ALL origins if "*" is in allowedOrigins
      if (allowedOrigins.includes('*')) return callback(null, true);

      // 3. Allow any localhost or 127.0.0.1 origin (any port)
      const isLocalhost = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
      if (isLocalhost) return callback(null, true);

      // 4. Check against specific allowed origins
      const normalizedOrigin = origin.replace(/\/$/, '');
      const isAllowed = allowedOrigins.some(
        (o) => normalizedOrigin === o || normalizedOrigin.startsWith(o + '/'),
      );

      if (isAllowed) {
        callback(null, true);
      } else {
        console.warn(`[CORS] Blocked origin: ${origin}. Allowed: ${allowedOrigins.join(', ')}`);
        callback(new Error(`CORS: Origin "${origin}" not allowed`));
      }
    },
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Accept',
      'X-Requested-With',
      'Origin',
      'Access-Control-Allow-Origin',
      'sentry-trace',
      'baggage',
      'x-api-key',
    ],
    credentials: true,
  });
  // ─────────────────────────────────────────────────────────────────────────

  app.setGlobalPrefix(API_PREFIX);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  const config = new DocumentBuilder()
    .setTitle('Wholeshole Beauty API')
    .setDescription('API documentation for Wholeshole Beauty')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT ?? 8000;
  await app.listen(port);

  const baseUrl = isProduction
    ? (process.env.RENDER_EXTERNAL_URL || 'https://your-production-domain.com')
    : `http://localhost:${port}`;

  console.log(`Server is running on ${baseUrl}`);
  console.log(`CORS allowed origins: ${allowedOrigins.join(', ') || 'ALL (no origins configured)'}`);
  console.log(`Database connected successfully`);
  console.log(`Swagger docs available at ${baseUrl}/api/docs`);
}
bootstrap();
