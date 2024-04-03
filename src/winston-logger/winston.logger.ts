import { createLogger, format, transports } from 'winston';

const winston_logger = createLogger({
  level: 'debug',
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`),
  ),

  transports: [
    new transports.Console(),
    new transports.File({ filename: 'combined.log' }), // Log everything to combined.log
    new transports.File({ filename: 'errors.log', level: 'error' }), // Log only errors to errors.log
  ],
});

export default winston_logger;
