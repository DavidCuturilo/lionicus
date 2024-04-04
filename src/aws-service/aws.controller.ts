import {
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AwsService } from './aws.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { Roles } from 'src/decorators/user-role.decorator';
import { UserRole } from 'src/enums/user-role.enum';
import { AuthGuard } from 'src/guards/auth.guard';

@UseGuards(AuthGuard)
@Controller('aws')
export class AwsController {
  constructor(private readonly awsService: AwsService) {}

  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
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

  @Roles(UserRole.USER, UserRole.SUPER_ADMIN)
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
    return this.awsService.deleteFile(fileId);
  }
}
