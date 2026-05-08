import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { OrderStatus } from '../entities/order.entity';

export class UpdateOrderStatusDto {
  @ApiProperty({
    enum: OrderStatus,
    description: 'New status of the order',
    example: OrderStatus.PROCESSING,
  })
  @IsEnum(OrderStatus)
  status!: OrderStatus;

  @ApiPropertyOptional({
    description: 'Optional note for the status change',
    example: 'Order is being packed',
  })
  @IsOptional()
  @IsString()
  note?: string;

  @ApiPropertyOptional({
    description: 'Tracking number (required when status is SHIPPED)',
    example: 'TRK123456789',
  })
  @IsOptional()
  @IsString()
  trackingNumber?: string;

  @ApiPropertyOptional({
    description: 'Courier name (required when status is SHIPPED)',
    example: 'FedEx',
  })
  @IsOptional()
  @IsString()
  courierName?: string;
}
