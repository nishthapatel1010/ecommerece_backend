import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  InternalServerErrorException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';

import { env } from '../../config/env';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: env.MAX_FILE_SIZE }),
          new FileTypeValidator({ fileType: env.ALLOWED_EXTENSIONS }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    try {
      const result = await this.uploadService.uploadImage(file);
      return {
        url: result.secure_url,
      };
    } catch (error) {
      throw new InternalServerErrorException('Failed to upload image');
    }
  }
}
