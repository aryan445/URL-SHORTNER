import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';

    // Log the error
    this.logger.error(
      `Exception caught: ${exception instanceof Error ? exception.message : 'Unknown error'}`,
      exception instanceof Error ? exception.stack : undefined,
    );
    this.logger.error(`Request URL: ${request.url}`);
    this.logger.error(`Request method: ${request.method}`);
    this.logger.error(`Request body (raw): ${JSON.stringify(request.body)}`);
    this.logger.error(`Request body keys: ${Object.keys(request.body || {}).join(', ')}`);
    this.logger.error(`Request body type: ${typeof request.body}`);
    this.logger.error(`Response: ${JSON.stringify(message)}`);

    // Ensure CORS headers are always sent
    response.header('Access-Control-Allow-Origin', request.headers.origin || '*');
    response.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
    response.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept');

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: typeof message === 'string' ? message : (message as any).message || message,
      ...(typeof message === 'object' && !Array.isArray(message) ? message : {}),
    });
  }
}
