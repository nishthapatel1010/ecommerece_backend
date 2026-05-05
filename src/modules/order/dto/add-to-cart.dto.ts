// src/modules/cart/dto/add-to-cart.dto.ts
import { IsUUID, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class AddToCartDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'The unique ID of the product' })
  @IsUUID()
  productId!: string;

  @ApiProperty({ example: 1, description: 'The quantity of the product to add to the cart', minimum: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantity!: number;
}