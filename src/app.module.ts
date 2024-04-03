import { Logger, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AuthController } from './auth/auth.controller';
import { AuthModule } from './auth/auth.module';
import { AuthService } from './auth/auth.service';
import mongoconfig from './config/mongoconfig';
import { UserRolesGuard } from './guards/user-role.guard';
import { Media, MediaSchema } from './schemas/media.schema';
import { User, UserSchema } from './schemas/user.schema';

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
  ],
  controllers: [AppController, AuthController],
  providers: [Logger, AuthService, UserRolesGuard],
})
export class AppModule {}
