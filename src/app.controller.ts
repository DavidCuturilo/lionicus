import { Controller, Post } from '@nestjs/common';
import winston_logger from './winston-logger/winston.logger';
import { AuthService } from './auth/auth.service';
import { AwsService } from './aws-service/aws.service';
import { UserRole } from './enums/user-role.enum';
import * as fs from 'fs';
import * as path from 'path';
import { Readable } from 'stream';

@Controller()
export class AppController {
  private readonly assetsFolder: string;

  constructor(
    private readonly authService: AuthService,
    private readonly awsService: AwsService,
  ) {
    this.assetsFolder = path.join(process.cwd(), 'src/assets');
  }

  @Post('seed-data')
  async seedData() {
    winston_logger.info('Deleting existing data...');
    try {
      await this.authService.truncateUserSchema();
      await this.awsService.truncateMediaSchema();
      winston_logger.info('All data has been deleted successfully...');
    } catch (error) {
      winston_logger.error('Failed to delete existing data');
    }

    winston_logger.info('Seeding data...');
    const users = [
      {
        email: 'super-admin@gmail.com',
        password: 'super-admin',
        userRole: UserRole.SUPER_ADMIN,
      },
      {
        email: 'admin@gmail.com',
        password: 'admin',
        userRole: UserRole.ADMIN,
      },
      {
        email: 'user@gmail.com',
        password: 'user',
        userRole: UserRole.USER,
      },
    ];

    for (const user of users) {
      winston_logger.info(`Seeding user ${user.email}`);
      try {
        await this.authService.register(user);
      } catch (error) {
        winston_logger.error(`Failed to seed user ${user.email}`);
        return {
          error: 'Failed while seeding users',
        };
      }
    }

    try {
      const fileNames = fs.readdirSync(this.assetsFolder);

      const fileContents: Express.Multer.File[] = [];

      fileNames.forEach((fileName) => {
        const filePath = path.join(this.assetsFolder, fileName);
        const fileContent = fs.readFileSync(filePath);

        const mimeType = this.getMimeType(fileName);

        const file: Express.Multer.File = {
          buffer: fileContent,
          originalname: fileName,
          mimetype: mimeType,
          fieldname: 'file',
          encoding: '7bit',
          size: fileContent.length,
          stream: new Readable(),
          destination: '',
          filename: fileName,
          path: '',
        };
        fileContents.push(file);
      });

      const { fileIds } = await this.awsService.uploadFiles(fileContents);
      winston_logger.info('Data seeded successfully');

      return {
        fileIds,
        users: users.map((user) => {
          return {
            email: user.email,
            password: user.password,
          };
        }),
      };
    } catch (error) {
      winston_logger.error('Failed to seed data');
      return {
        error: 'Failed while seeding media files',
      };
    }
  }

  getMimeType(fileName: string) {
    const ext = path.extname(fileName).toLowerCase();
    switch (ext) {
      case '.png':
        return 'image/png';
      case '.jpg':
      case '.jpeg':
        return 'image/jpeg';
      case '.mp4':
        return 'video/mp4';
      case '.webp':
        return 'image/webp';
      default:
        return 'application/octet-stream';
    }
  }
}
