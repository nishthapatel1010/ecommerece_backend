import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { env } from '../../config/env';


@Injectable()
export class CSVValidationPipe implements PipeTransform {
  transform(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    const allowedMimeTypes = env.ALLOWED_PRODUCT_IMPORT_TYPES.split(',').map(t => t.trim());

    // Log for debugging if needed (visible in server logs)
    // console.log(`Uploading file with mimetype: ${file.mimetype}`);

    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(`Invalid file type: ${file.mimetype}. Expected one of: ${allowedMimeTypes.join(', ')}`);
    }

    // Optional: Also check file size here since we are bypassing ParseFilePipe
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new BadRequestException(`File too large. Maximum size allowed is 10MB`);
    }

    return file;
  }
}
