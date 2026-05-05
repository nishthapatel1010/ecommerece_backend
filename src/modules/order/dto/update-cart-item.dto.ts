// src/modules/cart/dto/update-cart-item.dto.ts
import { IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateCartItemDto {
  @ApiProperty({ example: 2, description: 'The new quantity for the cart item', minimum: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantity!: number;
}