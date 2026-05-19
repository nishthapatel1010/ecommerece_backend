import { ApiProperty } from '@nestjs/swagger';

export class ProductLookupResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id!: string;

  @ApiProperty({ example: 'Product Name' })
  name!: string;

  @ApiProperty({ example: 29.99 })
  current_price!: number;

  @ApiProperty({ example: 100 })
  stock_quantity!: number;

  @ApiProperty({ example: ['https://example.com/image.jpg'] })
  images!: string[];

  @ApiProperty({ example: true })
  isAvailable!: boolean;
}
