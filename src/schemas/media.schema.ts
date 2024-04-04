import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { MimeType } from 'src/enums/mime-type.enum';

export type MediaDocument = HydratedDocument<Media>;

@Schema()
export class Media {
  @Prop()
  name: string;

  @Prop({ unique: true })
  fileId: string;

  @Prop({ enum: MimeType })
  type: MimeType;

  @Prop({
    type: Date,
    default: Date.now,
  })
  created: string;
}

export const MediaSchema = SchemaFactory.createForClass(Media);
