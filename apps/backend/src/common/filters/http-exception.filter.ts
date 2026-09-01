import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import * as Sentry from '@sentry/node';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
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

    const payload = message as Record<string, unknown>;
    const errorResponse: Record<string, unknown> = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: (payload?.message as string) || message || 'Internal server error',
      error: (payload?.error as string) || (exception as any).name || 'Error',
    };
    if (Array.isArray(payload?.errors)) {
      errorResponse.errors = payload.errors;
    }

    // Only genuinely unexpected (5xx) failures go to Sentry — 4xx HttpExceptions
    // are normal, expected business-logic responses (validation errors, not
    // founds, etc.), not bugs, and would just be noise in error tracking.
    if (status === HttpStatus.INTERNAL_SERVER_ERROR) {
      console.error('Unhandled Exception:', exception);
      Sentry.captureException(exception);
    }

    response.status(status).json(errorResponse);
  }
}
