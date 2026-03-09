import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { NextFunction, Request, Response } from 'express';
import { ValidationPipe, HttpException, HttpStatus } from '@nestjs/common';
import * as logger from './app/logger/logger';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AllExceptionsFilter } from './app/exceptions/http-exception.filter';
import { UrlService } from './app/url/url.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: logger.default,
  });
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: false, // Temporarily allow extra fields for debugging
      transformOptions: {
        enableImplicitConversion: true,
      },
      exceptionFactory: (errors) => {
        const messages = errors.map((error) => {
          const constraints = error.constraints || {};
          const property = error.property || 'unknown';
          const fieldMessages = Object.values(constraints).join(', ');
          return `${property}: ${fieldMessages}`;
        });
        return new HttpException(
          {
            statusCode: 400,
            message: 'Validation failed',
            errors: messages,
          },
          400,
        );
      },
    }),
  );
  
  // Get UrlService instance for root-level redirects (before setting global prefix)
  const urlService = app.get(UrlService);
  
  // Middleware to handle root-level short URL redirects (e.g., /6a856b62)
  // This MUST run BEFORE setting the global prefix
  app.use(async (req: Request, res: Response, next: NextFunction) => {
    // Skip if it's already under /api prefix
    if (req.url.startsWith('/api/') || req.url.startsWith('/api')) {
      return next();
    }
    
    // Skip if it's root, favicon, or other common paths
    if (req.url === '/' || req.url === '/favicon.ico' || req.url.startsWith('/_next/') || req.url.includes('.')) {
      if (req.url === '/') {
        res.sendStatus(200);
        return;
      }
      return next();
    }
    
    // Handle root-level short key redirects (GET requests only)
    // Pattern: /{shortKey} where shortKey is alphanumeric and 3-32 chars
    const shortKeyMatch = req.url.match(/^\/([a-zA-Z0-9_-]{3,32})$/);
    if (req.method === 'GET' && shortKeyMatch) {
      const shortKey = shortKeyMatch[1];
      try {
        const result = await urlService.getOriginalUrl(shortKey);
        if (result) {
          return res.redirect(result.statusCode, result.url);
        }
        // If not found, return 404
        return res.status(404).json({
          statusCode: 404,
          message: 'Short URL not found',
          path: req.url,
        });
      } catch (error) {
        // Handle expired links or other errors
        const statusCode = error.status || 500;
        const message = error.message || 'Internal server error';
        return res.status(statusCode).json({
          statusCode,
          message,
          path: req.url,
        });
      }
    }
    
    next();
  });
  
  app.setGlobalPrefix('/api');
  
  // Middleware to normalize request body before validation
  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.url === '/') {
      res.sendStatus(200);
      return;
    }
    // Normalize body for POST /api/url - check multiple URL patterns
    const isUrlRoute = 
      req.originalUrl === '/api/url' || 
      req.url === '/api/url' || 
      req.url === '/url' ||
      req.path === '/url' ||
      req.originalUrl?.endsWith('/url');
    
    if (req.method === 'POST' && isUrlRoute && req.body) {
      console.log('[Middleware] URL route detected - URL:', req.url, 'OriginalURL:', req.originalUrl, 'Path:', req.path);
      console.log('[Middleware] Before normalization - Body:', JSON.stringify(req.body));
      
      // Handle 'originalUrl' -> 'url'
      if (req.body.originalUrl && !req.body.url) {
        req.body.url = req.body.originalUrl;
        delete req.body.originalUrl;
        console.log('[Middleware] Converted originalUrl to url');
      }
      
      // Ensure url is a string and not empty
      if (req.body.url !== undefined && req.body.url !== null) {
        if (typeof req.body.url !== 'string') {
          req.body.url = String(req.body.url);
        }
        req.body.url = req.body.url.trim();
      }
      
      console.log('[Middleware] After normalization:', JSON.stringify(req.body));
    }
    next();
  });

  const swaggerConfig = new DocumentBuilder()
    .setTitle('URL Shortener API')
    .setDescription('Shorten URLs, manage links, and track clicks. Login or register to get an access token, then click **Authorize** and paste it.')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'JWT-auth',
    )
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);
  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      // Allow localhost on any port for development
      if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
        return callback(null, true);
      }
      // In production, you'd check against a whitelist
      callback(null, true); // Allow all for now, change in production
    },
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    exposedHeaders: ['Content-Type', 'Authorization'],
    credentials: true, // Must be true when frontend sends withCredentials
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  await app.listen(3000);
}
bootstrap();
