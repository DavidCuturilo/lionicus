import { Module } from '@nestjs/common';
import { AwsController } from './aws.controller';
import { AwsService } from './aws.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Media, MediaSchema } from 'src/schemas/media.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Media.name, schema: MediaSchema }]),
  ],
  controllers: [AwsController],
  providers: [AwsService],
})
export class AwsModule {}
