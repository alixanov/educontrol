import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { json, urlencoded } from 'express';
import { ValidationPipe } from '@nestjs/common';
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

  // Security HTTP Headers Middleware
  app.use((_req: any, res: any, next: any) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
  });

  // Safe and strict CORS configuration
  const defaultOrigins = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:5000',
    'http://127.0.0.1:5000',
  ];
  const customOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim()).filter(Boolean)
    : [];
  const allowedOrigins = new Set([...defaultOrigins, ...customOrigins]);

  app.enableCors({
    origin: (origin, callback) => {
      // Allow non-browser requests (tools, internal service calls, OpenCV pipeline) or matching origins
      if (!origin || allowedOrigins.has(origin)) {
        callback(null, true);
      } else {
        callback(new Error('CORS xatoligi: manbaga ruxsat berilmagan (Not allowed by CORS)'));
      }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Global Input Validation & Transformation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
      forbidUnknownValues: false,
    }),
  );

  // Biometric captures and reference photo payload limits (25MB)
  app.use(json({ limit: '25mb' }));
  app.use(urlencoded({ extended: true, limit: '25mb' }));

  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.includes('super-secret')) {
    console.warn('[XAVFSIZLIK OGOHLANTIRISHI] Standart yoki sodda JWT_SECRET ishlatilmoqda. Ishlab chiqarishda kuchli tasodifiy kalitdan foydalaning.');
  }

  const port = process.env.PORT || 5000;
  await app.listen(port);
  console.log(`====================================================`);
  console.log(`EduControl Server xavfsiz rejimda ishga tushdi: http://localhost:${port}`);
  console.log(`====================================================`);
}
bootstrap();
