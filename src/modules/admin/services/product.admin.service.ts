// src/modules/admin/services/product.admin.service.ts
import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../../product/entities/product.entity';
import { CreateProductDto } from '../dto/product/create-product.dto';
import { UpdateProductDto } from '../dto/product/update-product.dto';

@Injectable()
export class ProductAdminService {
  constructor(
    @InjectRepository(Product)
    private readonly repo: Repository<Product>,
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
    const [data, total] = await this.repo.findAndCount({
      withDeleted: true,
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
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

    Object.assign(product, dto);

    try {
      return await this.repo.save(product);
    } catch (error:any) {
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
}