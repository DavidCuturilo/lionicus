import { S3 } from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import { configService } from 'src/config/config.service';
import winston_logger from 'src/winston-logger/winston.logger';
import { v4 as uuidv4 } from 'uuid';
import { InjectModel } from '@nestjs/mongoose';
import { Media } from 'src/schemas/media.schema';
import { Model } from 'mongoose';

@Injectable()
export class AwsService {
  private client: S3;

  constructor(
    @InjectModel(Media.name)
    private mediaModel: Model<Media>,
  ) {
    this.client = new S3({
      region: configService.getValue(`AWS_REGION`),
      credentials: {
        accessKeyId: configService.getValue(`AWS_ACCESS_KEY_ID`),
        secretAccessKey: configService.getValue(`AWS_SECRET_ACCESS_KEY`),
      },
    });
  }

  async uploadFile(file: Express.Multer.File) {
    let fileId = uuidv4();
    let response;
    switch (file.mimetype) {
      case 'image/jpeg':
      case 'image/jpg':
      case 'image/png':
        winston_logger.info('Uploading image file...');
        fileId = 'i' + fileId;
        response = await this.upload(file, fileId);
        winston_logger.info('Image file uploaded successfully');
        break;
      case 'video/mp4':
      case 'video/webm':
        winston_logger.info('Uploading video file...');
        fileId = 'v' + fileId;
        response = await this.upload(file, fileId);
        winston_logger.info('Video file uploaded successfully');
        break;
      default:
        throw new Error('Invalid file type');
    }
    return response || `File uploaded successfully with id ${fileId}`;
  }

  async upload(file: Express.Multer.File, fileId: string) {
    const mediaBytes = file.buffer;
    const params = {
      Bucket: configService.getValue(`AWS_BUCKET_NAME`),
      Key: fileId,
      Body: mediaBytes,
    };
    await this.client.putObject(params);
    await this.mediaModel.create({
      name: file.originalname,
      fileId,
      type: file.mimetype,
    });
    return {
      message: 'File uploaded successfully',
      fileId,
    };
  }

  async downloadFile(fileId: string) {
    winston_logger.info(`Download started...`);
    const file = await this.mediaModel.findOne({ fileId });
    if (!file) {
      throw new Error('File not found');
    }
    const params = {
      Bucket: configService.getValue(`AWS_BUCKET_NAME`),
      Key: fileId,
    };
    const fileContent: { data: Buffer } = (await this.collectStreamData(
      await this.client.getObject(params),
    )) as {
      data: Buffer;
    };
    winston_logger.info(`File with id ${fileId} downloaded successfully`);
    return { content: fileContent.data as Buffer, type: file.type };
  }

  private async collectStreamData(obj) {
    const stream = obj.Body;
    return new Promise((resolve, reject) => {
      const chunks = [];
      stream.on('data', (chunk: Buffer) => {
        chunks.push(chunk);
      });
      stream.on('end', () => {
        const buffer = Buffer.concat(chunks);
        resolve({ data: buffer, metadata: obj.Metadata });
      });
      stream.on('error', reject);
    });
  }

  async deleteFile(fileId: string) {
    winston_logger.info(`Deleting file...`);
    const file = await this.mediaModel.findOne({ fileId });
    if (!file) {
      throw new Error('File not found');
    }
    const params = {
      Bucket: configService.getValue(`AWS_BUCKET_NAME`),
      Key: fileId,
    };
    await this.client.deleteObject(params);
    await this.mediaModel.deleteOne({ fileId });
    winston_logger.info(`File with id ${fileId} deleted successfully`);
    return 'File deleted successfully';
  }

  async updateFile(fileId: string, file: Express.Multer.File) {
    winston_logger.info(`Updating file...`);
    const existingFile = await this.mediaModel.findOne({ fileId });
    if (!existingFile) {
      throw new Error('File not found');
    }
    const params = {
      Bucket: configService.getValue(`AWS_BUCKET_NAME`),
      Key: fileId,
      Body: file.buffer,
    };
    await this.client.putObject(params);
    await this.mediaModel.updateOne(
      { fileId },
      { name: file.originalname, type: file.mimetype },
    );
    winston_logger.info(`File with id ${fileId} updated successfully`);
  }

  async uploadFiles(files: Express.Multer.File[]) {
    winston_logger.info(`Seeding data...`);
    const response = [];
    for (const file of files) {
      response.push((await this.uploadFile(file)).fileId);
    }
    winston_logger.info(`Data seeded successfully`);
    return {
      message: 'Files uploaded successfully',
      fileIds: response,
    };
  }

  async truncateMediaSchema() {
    await this.mediaModel.deleteMany({});
  }
}
