import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import winston_logger from 'src/winston-logger/winston.logger';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const baseUrl = req.baseUrl;
    const method = req.method;
    const startTimestamp = Date.now();

    winston_logger.debug(`${method} called on route ${baseUrl}`);

    if (method === 'POST' && req.body) {
      winston_logger.debug(`Request body: ${JSON.stringify(req.body)}`);
    } else if (
      req.method === 'GET' &&
      req.query &&
      Object.keys(req.query).length > 0
    ) {
      if (typeof req.query === 'object') {
        winston_logger.verbose(`Query: ${JSON.stringify(req.query)}`);
      } else {
        winston_logger.verbose(`Query: ${req.query}`);
      }
    }

    res.on('finish', () => {
      const endTimestamp = Date.now();

      winston_logger.debug(
        `${method} ${baseUrl} finished in ${endTimestamp - startTimestamp}ms`,
        'LoggerMiddleware',
      );
    });

    next();
  }
}
