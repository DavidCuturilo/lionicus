import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Logger, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { LoggerMiddleware } from './middleware/logger.middleware';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import mongoconfig from './config/mongoconfig';
import { User, UserSchema } from './schemas/user.schema';
import { AuthModule } from './auth/auth.module';
import { UserRolesGuard } from './guards/user-role.guard';
import { Media, MediaSchema } from './schemas/media.schema';
import { AwsModule } from './aws-service/aws.module';
import { AwsController } from './aws-service/aws.controller';
import { AwsService } from './aws-service/aws.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot(mongoconfig.database),
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Media.name, schema: MediaSchema },
    ]),
    AuthModule,
    AwsModule,
  ],
  controllers: [AppController, AuthController, AwsController],
  providers: [Logger, AuthService, AwsService, UserRolesGuard],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
