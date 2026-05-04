// src/modules/admin/dto/product/create-product.dto.ts

import {
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsInt,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  brand?: string;

  @IsString()
  sku!: string;

  @IsOptional()
  @IsString()
  upc?: string;

  @IsOptional()
  @IsString()
  itemNumber?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsString()
  size?: string;

  @IsOptional()
  @IsString()
  caseUnit?: string;

  @IsOptional()
  @IsString()
  unit?: string;

  @IsOptional()
  @IsNumber()
  basePrice?: number;

  @IsOptional()
  @IsInt()
  breakQty?: number;

  @IsOptional()
  @IsNumber()
  breakPrice?: number;

  @IsOptional()
  @IsInt()
  minQty?: number;

  @IsOptional()
  @IsBoolean()
  available?: boolean;
}