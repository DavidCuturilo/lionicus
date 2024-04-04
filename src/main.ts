import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as bodyParser from 'body-parser';
import { configService } from './config/config.service';
import winston_logger from './winston-logger/winston.logger';
import { GlobalExceptionFilter } from './exception-filter/exception-filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(bodyParser.json({ limit: '50mb' }));
  app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.useGlobalFilters(new GlobalExceptionFilter());

  await app.listen(configService.getPort());
  winston_logger.info(
    `Application is running on port: ${configService.getPort()}`,
  );
}
bootstrap();
