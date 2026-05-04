// src/modules/product/services/product.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Product } from '../entities/product.entity';
import { GetProductsDto } from '../dto/get-products.dto';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
  ) {}

  async getProducts(query: GetProductsDto) {
    const { page = 1, limit = 30, search, brand, letter } = query;

    const qb = this.productRepo.createQueryBuilder('product');

    qb.select([
      'product.id',
      'product.name',
      'product.sku',
      'product.upc',
      'product.itemNumber',
      'product.imageUrl',
      'product.size',
      'product.caseUnit',
      'product.unit',
      'product.basePrice',
      'product.breakQty',
      'product.breakPrice',
      'product.minQty',
      'product.available',
    ]);

    if (search) {
      qb.andWhere('product.name ILIKE :search', {
        search: `%${search}%`,
      });
    }

    if (brand) {
      qb.andWhere('product.name ILIKE :brand', { brand: `${brand}%` });
    }

    if (letter) {
      qb.andWhere('UPPER(LEFT(TRIM(product.name), 1)) = :letter', { letter });
    }

    qb.skip((page - 1) * limit).take(limit);

    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getProductById(id: string) {
    const product = await this.productRepo.findOne({
      where: { id },
    });

    if (!product) throw new NotFoundException('Product not found');

    return product;
  }

  async getSummary() {
    const totalItems = await this.productRepo.count();

    const inStock = await this.productRepo.count({
      where: { available: true },
    });

    const outOfStock = totalItems - inStock;

    return {
      totalItems,
      inStock,
      outOfStock,
    };
  }

  async getBrands() {
    // This extracts the first word of the name column as the brand.
    // If your brands are multiple words, we might need a more complex extraction.
    const results = await this.productRepo
      .createQueryBuilder('product')
      .select('DISTINCT SPLIT_PART(TRIM(product.name), \' \', 1)', 'brand')
      .where('product.name IS NOT NULL')
      .orderBy('brand', 'ASC')
      .getRawMany();

    return results.map((r) => r.brand).filter((b) => b && b.length > 0);
  }

  async getLetters() {
    const letters = await this.productRepo
      .createQueryBuilder('product')
      .select('DISTINCT UPPER(LEFT(TRIM(product.name), 1))', 'letter')
      .orderBy('letter', 'ASC')
      .getRawMany();

    return letters.map((l) => l.letter);
  }
}