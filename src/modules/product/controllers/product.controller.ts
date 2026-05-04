

import { Controller, Get, Param, Query } from '@nestjs/common';
import { ProductService } from '../services/product.service';
import { GetProductsDto } from '../dto/get-products.dto';

@Controller()
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get('products')
  getProducts(@Query() query: GetProductsDto) {
    return this.productService.getProducts(query);
  }

  @Get('products/:id')
  getProductById(@Param('id') id: string) {
    return this.productService.getProductById(id);
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