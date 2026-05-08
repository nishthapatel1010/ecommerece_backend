import { Injectable, BadRequestException, Inject } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';
import { Readable } from 'stream';

@Injectable()
export class UploadService {
  constructor(@Inject('CLOUDINARY') private readonly cloudinaryInstance: any) {}

  async uploadImage(
    file: Express.Multer.File,
    folder: string = 'samples/Beautyshop_ecommerce',
    sku?: string,
    itemNumber?: string
  ): Promise<UploadApiResponse | UploadApiErrorResponse> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    // Determine target folder
    const targetFolder = sku && itemNumber 
      ? `samples/Beautyshop_ecommerce/${sku}/${itemNumber}`
      : folder;

    return new Promise((resolve, reject) => {
      const upload = cloudinary.uploader.upload_stream(
        {
          folder: targetFolder,
          transformation: [{ width: 1200, crop: 'limit' }],
        },
        (error, result) => {
          if (error) return reject(error);
          if (!result) return reject(new Error('Upload failed: no result from Cloudinary'));
          resolve(result);
        },
      );

      // Convert buffer to stream and pipe to cloudinary
      const stream = new Readable();
      stream.push(file.buffer);
      stream.push(null);
      stream.pipe(upload);
    });
  }

  async uploadFromUrl(
    url: string,
    folder: string = 'samples/Beautyshop_ecommerce'
  ): Promise<UploadApiResponse | UploadApiErrorResponse> {
    if (!url) {
      throw new BadRequestException('No URL provided');
    }

    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload(url, {
        folder,
        transformation: [{ width: 1200, crop: 'limit' }],
      }, (error, result) => {
        if (error) return reject(error);
        if (!result) return reject(new Error('Upload failed: no result from Cloudinary'));
        resolve(result);
      });
    });
  }

  async deleteImage(publicId: string): Promise<any> {
    if (!publicId) return;
    return new Promise((resolve, reject) => {
      cloudinary.uploader.destroy(publicId, (error, result) => {
        if (error) {
          console.error('Cloudinary delete error:', error);
          return resolve(null); // Continue even if delete fails as per requirement
        }
        resolve(result);
      });
    });
  }
}
