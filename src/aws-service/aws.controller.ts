import {
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Res,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AwsService } from './aws.service';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { Roles } from 'src/decorators/user-role.decorator';
import { UserRole } from 'src/enums/user-role.enum';
import { AuthGuard } from 'src/guards/auth.guard';
import { UserRolesGuard } from 'src/guards/user-role.guard';

@UseGuards(AuthGuard, UserRolesGuard)
@Controller('aws')
export class AwsController {
  constructor(private readonly awsService: AwsService) {}

  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @UseInterceptors(FileInterceptor('file'))
  @Post('upload')
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    return await this.awsService.uploadFile(file);
  }

  @Get('download/:fileId')
  async downloadFile(@Param('fileId') fileId: string, @Res() res) {
    const response = await this.awsService.downloadFile(fileId);
    res.setHeader('Content-Type', response.type);
    return res.end(response.content);
  }

  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @UseInterceptors(FileInterceptor('file'))
  @Patch('update/:fileId')
  async updateFile(
    @Param('fileId') fileId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return await this.awsService.updateFile(fileId, file);
  }

  @Roles(UserRole.SUPER_ADMIN)
  @Delete('delete/:fileId')
  async deleteFile(@Param('fileId') fileId: string) {
    return await this.awsService.deleteFile(fileId);
  }

  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @UseInterceptors(FilesInterceptor('files'))
  @Post('seed-data')
  async seedData(@UploadedFiles() files: Array<Express.Multer.File>) {
    return await this.awsService.seedData(files);
  }
}
