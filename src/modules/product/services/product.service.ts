
import { Injectable, NotFoundException } from '@nestjs/common';
import { ProductRepository } from '../repositories/product.repository';
import { GetProductsDto } from '../dto/get-products.dto';
import { VoiceSearchDto } from '../dto/voice-search.dto';
import { sanitizeVoiceText } from '../../../common/utils/string.util';

@Injectable()
export class ProductService {
  constructor(
    private readonly productRepo: ProductRepository,
  ) {}

  async getProducts(query: GetProductsDto) {
    return this.productRepo.findWithFilters(query);
  }

  async voiceSearch(dto: VoiceSearchDto) {
    const sanitizedText = sanitizeVoiceText(dto.query);
    if (!sanitizedText) {
      return [];
    }
    return this.productRepo.findProductsByVoice(sanitizedText);
  }

  async getProductById(id: string) {
    const product = await this.productRepo.findOne({
      where: { id },
    });

    if (!product) throw new NotFoundException('Product not found');

    return product;
  }

  async getProductBySku(sku: string) {
    const product = await this.productRepo.findOne({
      where: { sku },
      select: ['id', 'name', 'basePrice', 'stock', 'imageUrl', 'available'],
    });

    if (!product) {
      throw new NotFoundException(`Product with SKU "${sku}" not found`);
    }

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
    return this.productRepo.getBrands();
  }

  async getLetters() {
    return this.productRepo.getLetters();
  }
}