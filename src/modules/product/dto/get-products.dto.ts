// src/modules/product/dto/get-products.dto.ts

import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min, Max } from 'class-validator';

export class GetProductsDto {
  @ApiPropertyOptional({ default: 1, description: 'Page number' })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page: number = 1;

  @ApiPropertyOptional({ default: 30, description: 'Items per page' })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit: number = 30;

  @ApiPropertyOptional({ description: 'Filter by brand (matches start of product name)' })
  @IsString()
  @IsOptional()
  brand?: string;

  @ApiPropertyOptional({ description: 'Search term for product name' })
  @IsString()
  @IsOptional()
  search?: string;


  @ApiPropertyOptional({ description: 'Filter by first letter of product name' })
  @IsString()
  @IsOptional()
  @Transform(({ value }) => value?.toUpperCase())
  letter?: string;
}