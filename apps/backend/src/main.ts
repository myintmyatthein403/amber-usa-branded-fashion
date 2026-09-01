import './instrument-sentry';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { PrismaExceptionFilter } from './common/filters/prisma-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { rawBody: true });
  app.setGlobalPrefix('api');

  // Standard security headers (CSP is left to the frontend apps to set for
  // their own pages — this backend is an API, not a document server, so a
  // strict default-src would break nothing here but also protect nothing
  // beyond what the JSON-only responses already imply; the other headers
  // — X-Content-Type-Options, X-Frame-Options, HSTS, etc. — are the ones
  // that matter for an API and are all on by helmet's defaults).
  app.use(helmet());

  // Known static origins + any additional ones from env (comma-separated),
  // for production domains that aren't known at code-authoring time. The
  // `.vercel.app` wildcard remains for preview deployments during beta —
  // tighten this once production frontend/admin domains are finalized (see
  // Beta Readiness Audit P1 #7).
  const envOrigins = (process.env.CORS_ALLOWED_ORIGINS || '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);
  const allowedOrigins = [
    'https://amber-usa-branded-fashion-admin.vercel.app',
    'https://amber-usa-branded-fashion-frontend.vercel.app',
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    'http://localhost:5173', // Vite default
    ...envOrigins,
  ];

  app.enableCors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) {
        return callback(null, true);
      }

      const isAllowed = allowedOrigins.includes(origin) ||
                       origin.endsWith('.vercel.app') ||
                       origin.startsWith('http://localhost:');

      if (isAllowed) {
        callback(null, true);
      } else {
        console.warn(`CORS blocked for origin: ${origin}`);
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: 'Content-Type, Accept, Authorization, X-Requested-With, Apollo-Query-Plan, Array-Control-Allow-Origin',
  });

  app.useGlobalFilters(new PrismaExceptionFilter(), new HttpExceptionFilter());
  app.useGlobalInterceptors(new TransformInterceptor());

  // Setup Swagger
  const config = new DocumentBuilder()
    .setTitle('Amber Brand Fashion API')
    .setDescription(
      'The API documentation for Amber Brand Fashion e-commerce platform.',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`Backend running on: http://localhost:${port}/api`);
  console.log(`Swagger documentation: http://localhost:${port}/docs`);
}
bootstrap();
