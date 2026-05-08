import {
  Controller,
  Post,
  Patch,
  Delete,
  Get,
  Param,
  Body,
  Query,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  InternalServerErrorException,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { ProductAdminService } from '../services/product.admin.service';
import { CreateProductDto } from '../dto/product/create-product.dto';
import { UpdateProductDto } from '../dto/product/update-product.dto';
import { UploadService } from '../../upload/upload.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../user/entities/user.entity';
import { CSVValidationPipe } from '../../../common/pipes/csv-validation.pipe';

import { env } from '../../../config/env';

@ApiTags('Admin Products')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
@Controller('admin/products')
export class ProductAdminController {
  constructor(
    private readonly service: ProductAdminService,
    private readonly uploadService: UploadService,
  ) {}

  @Post('upload-image')
  @ApiOperation({ summary: 'Upload a product image to Cloudinary' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        sku: { type: 'string' },
        itemNumber: { type: 'string' },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadProductImage(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: env.MAX_FILE_SIZE }),
          new FileTypeValidator({ fileType: env.ALLOWED_EXTENSIONS }),
        ],
      }),
    )
    file: Express.Multer.File,
    @Body('sku') sku?: string,
    @Body('itemNumber') itemNumber?: string,
  ) {
    try {
      const result = await this.uploadService.uploadImage(file, 'samples/Beautyshop_ecommerce', sku, itemNumber);
      return {
        success: true,
        message: 'Image uploaded successfully',
        data: {
          url: result.secure_url,
          public_id: result.public_id,
        },
      };
    } catch (error) {
      throw new InternalServerErrorException('Failed to upload image to Cloudinary');
    }
  }

  @Post()
  create(@Body() dto: CreateProductDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 30,
  ) {
    return this.service.findAll(Number(page), Number(limit));
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
  ) {
    return this.service.update(id, dto);
  }

  @Patch(':id/toggle')
  toggle(@Param('id') id: string) {
    return this.service.toggleAvailability(id);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.service.delete(id);
  }

  @Post('import')
  @ApiOperation({ summary: 'Bulk import products via CSV' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async importProducts(
    @UploadedFile(new CSVValidationPipe()) file: Express.Multer.File,
  ) {
    return this.service.importProducts(file.buffer);
  }
}