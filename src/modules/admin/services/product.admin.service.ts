// src/modules/admin/services/product.admin.service.ts
import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { Product } from '../../product/entities/product.entity';
import { CreateProductDto } from '../dto/product/create-product.dto';
import { UpdateProductDto } from '../dto/product/update-product.dto';
import { UploadService } from '../../upload/upload.service';
import { ProductRepository } from '../../product/repositories/product.repository';
import { parse } from 'csv-parse/sync';

@Injectable()
export class ProductAdminService {
  constructor(
    private readonly repo: ProductRepository,
    private readonly uploadService: UploadService,
  ) {}

  async create(dto: CreateProductDto) {
    try {
      const product = this.repo.create(dto);
      return await this.repo.save(product);
    } catch (error:any) {
      if (error.code === '23505') {
        throw new ConflictException('SKU already exists');
      }
      throw error;
    }
  }

  async findAll(page = 1, limit = 30) {
    return this.repo.findAllAdmin(page, limit);
  }

  async findBySku(sku: string) {
    const product = await this.repo.findOne({
      where: { sku },
      select: ['id', 'name', 'basePrice', 'stock', 'imageUrl', 'available'],
      withDeleted: false,
    });

    if (!product) {
      throw new NotFoundException(`Product with SKU "${sku}" not found`);
    }

    return product;
  }

  async findOne(id: string) {
    const product = await this.repo.findOne({
      where: { id },
      withDeleted: true,
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async update(id: string, dto: UpdateProductDto) {
    const product = await this.findOne(id);

    if (dto.imageUrl && dto.imagePublicId && product.imagePublicId && dto.imagePublicId !== product.imagePublicId) {
      try {
        await this.uploadService.deleteImage(product.imagePublicId);
      } catch (error) {
        console.error(`Failed to delete old image ${product.imagePublicId}:`, error);
      }
    }

    Object.assign(product, dto);

    try {
      return await this.repo.save(product);
    } catch (error: any) {
      if (error.code === '23505') {
        throw new ConflictException('SKU already exists');
      }
      throw error;
    }
  }

  async delete(id: string) {
    const product = await this.findOne(id);

    await this.repo.softRemove(product);

    return { message: 'Product deleted successfully' };
  }

  async toggleAvailability(id: string) {
    const product = await this.findOne(id);

    product.available = !product.available;

    return this.repo.save(product);
  }

  async importProducts(fileBuffer: Buffer) {
    const records: any[] = parse(fileBuffer, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    const summary = {
      total: records.length,
      created: 0,
      updated: 0,
      failed: 0,
      errors: [] as { row: number; message: string }[],
    };

    const skusInCsv = new Set<string>();

    for (let i = 0; i < records.length; i++) {
      const rowNumber = i + 2;
      const record = records[i];

      try {
        const sku = record.sku?.trim();
        if (!sku) {
          throw new Error('Missing SKU');
        }

        if (skusInCsv.has(sku)) {
          throw new Error(`Duplicate SKU in CSV: ${sku}`);
        }
        skusInCsv.add(sku);

        const name = record.name?.trim();
        const basePrice = record.base_price || record.price;
        const stock = record.stock;
        const imageUrl = record.image_url?.trim();
        const imagePublicId = record.image_public_id?.trim();

        let product = await this.repo.findOne({ where: { sku } });

        if (imageUrl && !imagePublicId && imageUrl.startsWith('http')) {
          try {
            const findVal = (rec: any, target: string) => {
              const normalizedTarget = target.toLowerCase().replace(/[\s_-]/g, '');
              const key = Object.keys(rec).find(k => k.toLowerCase().replace(/[\s_-]/g, '') === normalizedTarget);
              return key ? rec[key]?.trim() : null;
            };

            const cleanSku = findVal(record, 'sku') || sku;
            const cleanItemNumber = findVal(record, 'itemnumber') || findVal(record, 'itemno') || (product ? product.itemNumber : cleanSku);

            const folder = `samples/Beautyshop_ecommerce/${cleanSku}/${cleanItemNumber}`;
            const uploadResult = await this.uploadService.uploadFromUrl(imageUrl, folder);
            record.image_url = uploadResult.secure_url;
            record.image_public_id = uploadResult.public_id;
          } catch (error) {
            console.error(`Failed to auto-ingest image from ${imageUrl}:`, error);
          }
        }

        if (product) {
          this.updateFields(product, record);
          await this.repo.save(product);
          summary.updated++;
        } else {
          if (!name || !basePrice) {
            throw new Error(`Missing required fields for new product: name and price/base_price are required`);
          }

          product = this.repo.create({
            sku,
            name,
            basePrice: parseFloat(basePrice),
            stock: stock ? parseInt(stock, 10) : 0,
          });
          
          this.updateFields(product, record);
          await this.repo.save(product);
          summary.created++;
        }
      } catch (error: any) {
        summary.failed++;
        summary.errors.push({
          row: rowNumber,
          message: error.message,
        });
      }
    }

    return summary;
  }

  private updateFields(product: Product, record: any) {
    const fieldsMap: Record<string, keyof Product> = {
      name: 'name',
      upc: 'upc',
      item_number: 'itemNumber',
      image_url: 'imageUrl',
      image_public_id: 'imagePublicId',
      size: 'size',
      case_unit: 'caseUnit',
      unit: 'unit',
      base_price: 'basePrice',
      price: 'basePrice',
      break_qty: 'breakQty',
      break_price: 'breakPrice',
      min_qty: 'minQty',
      stock: 'stock',
      available: 'available',
    };

    for (const [csvKey, entityKey] of Object.entries(fieldsMap)) {
      const val = record[csvKey];
      if (val !== undefined && val !== null && val !== '') {
        if (entityKey === 'basePrice' || entityKey === 'breakPrice') {
          (product as any)[entityKey] = parseFloat(val);
        } else if (entityKey === 'stock' || entityKey === 'breakQty' || entityKey === 'minQty') {
          (product as any)[entityKey] = parseInt(val, 10);
        } else if (entityKey === 'available') {
          (product as any)[entityKey] = val.toLowerCase() === 'true' || val === '1';
        } else {
          (product as any)[entityKey] = val;
        }
      }
    }
  }
}