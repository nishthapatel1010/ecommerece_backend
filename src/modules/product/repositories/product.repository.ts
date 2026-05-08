import { Injectable } from '@nestjs/common';
import { Brackets, DataSource, Repository } from 'typeorm';
import { Product } from '../entities/product.entity';
import { GetProductsDto } from '../dto/get-products.dto';

@Injectable()
export class ProductRepository extends Repository<Product> {
  constructor(private dataSource: DataSource) {
    super(Product, dataSource.createEntityManager());
  }

  async findWithFilters(query: GetProductsDto) {
    const { page = 1, limit = 30, search, brand, letter } = query;

    const qb = this.createQueryBuilder('product');

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

  async findProductsByVoice(sanitized: string, page: number = 1, limit: number = 30): Promise<Product[]> {
    if (!sanitized || sanitized.length < 2) return [];

    const skip = (page - 1) * limit;
    const qb = this.createQueryBuilder('product');

    qb.select([
      'product.id',
      'product.name',
      'product.sku',
      'product.basePrice',
      'product.imageUrl',
    ]).where('product.available = :available', { available: true });

    qb.andWhere(
      new Brackets((orQb) => {
        orQb
          .where('product.name ILIKE :query', { query: `%${sanitized}%` })
          .orWhere("to_tsvector('english', product.name) @@ plainto_tsquery('english', :query)")
          .orWhere('similarity(product.name, :query) > 0.15');
      }),
    );

    qb.addSelect('similarity(product.name, :query)', 'sim_score')
      .orderBy('sim_score', 'DESC')
      .setParameter('available', true)
      .setParameter('query', sanitized);

    qb.skip(skip).take(limit);
    return qb.getMany();
  }
  async getBrands(): Promise<string[]> {
    const results = await this.createQueryBuilder('product')
      .select("DISTINCT SPLIT_PART(TRIM(product.name), ' ', 1)", 'brand')
      .where('product.name IS NOT NULL')
      .orderBy('brand', 'ASC')
      .getRawMany();

    return results.map((r) => r.brand).filter((b) => b && b.length > 0);
  }

  async getLetters(): Promise<string[]> {
    const letters = await this.createQueryBuilder('product')
      .select('DISTINCT UPPER(LEFT(TRIM(product.name), 1))', 'letter')
      .orderBy('letter', 'ASC')
      .getRawMany();

    return letters.map((l) => l.letter);
  }

  async findAllAdmin(page = 1, limit = 30) {
    const [data, total] = await this.findAndCount({
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
}
