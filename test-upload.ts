import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { UploadService } from './src/modules/upload/upload.service';
import * as fs from 'fs';

async function bootstrap() {
  try {
    const app = await NestFactory.createApplicationContext(AppModule);
    const uploadService = app.get(UploadService);

    const buffer = fs.readFileSync('test-image.png');
    const file = {
      buffer,
      originalname: 'test-image.png',
      mimetype: 'image/png',
      size: buffer.length,
    } as Express.Multer.File;

    console.log('Environment Variables Loaded:');
    console.log('CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME);
    console.log('API_KEY:', process.env.CLOUDINARY_API_KEY ? 'exists' : 'missing');
    console.log('API_SECRET:', process.env.CLOUDINARY_API_SECRET ? 'exists' : 'missing');

    console.log('Uploading test image to Cloudinary...');
    const result = await uploadService.uploadImage(file);
    console.log('Upload successful!');
    console.log('URL:', (result as any).secure_url);
    
    await app.close();
    process.exit(0);
  } catch (error) {
    console.error('Upload failed:', error);
    process.exit(1);
  }
}

bootstrap();
