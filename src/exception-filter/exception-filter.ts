import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import winston_logger from 'src/winston-logger/winston.logger';

export const getStatusCode = (exception: unknown): number => {
  return exception instanceof HttpException
    ? exception.getStatus()
    : HttpStatus.INTERNAL_SERVER_ERROR;
};

export const getErrorMessage = (exception: unknown): string => {
  if (exception instanceof HttpException) {
    return exception.message;
  } else {
    return String(exception);
  }
};
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('ExceptionFilter');

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const code = getStatusCode(exception);
    const message = getErrorMessage(exception);

    winston_logger.error(`${request.method} ${request.url}`);

    if (exception instanceof ForbiddenException) {
      winston_logger.error(
        `[FORBIDDEN] Request is not authenticated or allowed.`,
      );

      response.status(403).json({
        timestamp: new Date().toISOString(),
        path: request.url,
        code: 403,
        message: 'Forbidden: Request is not authenticated or allowed.',
      });
      return;
    }
    // * Bad Request Exception
    else if (exception instanceof BadRequestException) {
      winston_logger.warn(exception.message);
      let messageFormatted = JSON.stringify(
        (exception.getResponse() as any)?.message,
      );
      //regex to remove newline characters from error message
      messageFormatted = messageFormatted.replace(/,/g, '; ');
      //regex to remove escape characters from error message
      messageFormatted = messageFormatted.replace(/"/g, '');
      messageFormatted = messageFormatted.replace(/ +/g, ' ');
      messageFormatted = messageFormatted.replace(/\n/g, '');
      messageFormatted = messageFormatted.replace(/([\[\]])+/g, '');
      winston_logger.warn(
        JSON.stringify((exception.getResponse() as any)?.message),
      );
      //send original response
      response.status(code).json({
        timestamp: new Date().toISOString(),
        path: request.url,
        code,
        message,
        explanation: messageFormatted,
      });
      return;
    } else {
      winston_logger.error(exception.stack);
      response.status(code).json({
        timestamp: new Date().toISOString(),
        path: request.url,
        code,
        message,
      });
    }
  }
}
