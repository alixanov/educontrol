import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { json, urlencoded } from 'express';
import * as dotenv from 'dotenv';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Disable Express x-powered-by header for security
  const httpAdapter = app.getHttpAdapter();
  if (httpAdapter && typeof httpAdapter.getInstance === 'function') {
    const expressInstance = httpAdapter.getInstance();
    expressInstance.disable('x-powered-by');
  }

  // Safe CORS configuration
  const allowedOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
    : '*';

  app.enableCors({
    origin: allowedOrigins,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Enable payloads for biometric captures and reference photos
  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ extended: true, limit: '50mb' }));

  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.includes('super-secret')) {
    console.warn('[SECURITY WARNING] Using default or weak JWT_SECRET. In production, provide a strong random JWT_SECRET.');
  }

  const port = process.env.PORT || 5000;
  await app.listen(port);
  console.log(`====================================================`);
  console.log(`EduControl Server is running securely on port: ${port}`);
  console.log(`====================================================`);
}
bootstrap();
