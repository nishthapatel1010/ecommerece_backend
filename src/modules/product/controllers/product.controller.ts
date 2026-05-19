import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ProductService } from '../services/product.service';
import { GetProductsDto } from '../dto/get-products.dto';
import { VoiceSearchDto } from '../dto/voice-search.dto';
import { ProductLookupResponseDto } from '../../admin/dto/product/product-lookup-response.dto';

@ApiTags('Products')
@Controller()
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get('products')
  @ApiOperation({ summary: 'Get products with filters and pagination' })
  getProducts(@Query() query: GetProductsDto) {
    return this.productService.getProducts(query);
  }

  @Get('products/voice-search')
  @ApiOperation({ summary: 'Voice-to-text Filter search' })
  voiceSearch(@Query() query: VoiceSearchDto) {
    return this.productService.voiceSearch(query);
  }

  @Get('products/:id')
  getProductById(@Param('id') id: string) {
    return this.productService.getProductById(id);
  }

  @Get('products/sku/:skuNumber')
  @ApiOperation({ summary: 'Public high-performance Product Lookup by SKU for scanner' })
  @ApiResponse({ status: 200, type: ProductLookupResponseDto })
  async getProductBySku(@Param('skuNumber') skuNumber: string): Promise<ProductLookupResponseDto> {
    const product = await this.productService.getProductBySku(skuNumber);
    return {
      id: product.id,
      name: product.name,
      current_price: Number(product.basePrice),
      stock_quantity: product.stock,
      images: product.imageUrl ? [product.imageUrl] : [],
      isAvailable: product.stock > 0 && product.available,
    };
  }

  @Get('products/summary')
  getSummary() {
    return this.productService.getSummary();
  }

  @Get('filters/brands')
  getBrands() {
    return this.productService.getBrands();
  }

  @Get('filters/letters')
  getLetters() {
    return this.productService.getLetters();
  }
}