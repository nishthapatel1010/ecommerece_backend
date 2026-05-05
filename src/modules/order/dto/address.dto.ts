import { IsString, IsOptional, IsEmail, IsNotEmpty, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum ShippingMethod {
  DELIVERY = 'delivery',
  TRUCKING = 'trucking',
  PICKUP = 'pickup',
  UPS = 'ups',
}

export class SaveAddressDto {
  @ApiProperty({ example: 'Wholeshole Beauty' })
  @IsString()
  @IsNotEmpty()
  billCompany: string;

  @ApiProperty({ example: '123 Main St' })
  @IsString()
  @IsNotEmpty()
  billAddress1: string;

  @ApiProperty({ example: 'New York' })
  @IsString()
  @IsNotEmpty()
  billCity: string;

  @ApiProperty({ example: 'NY' })
  @IsString()
  @IsNotEmpty()
  billState: string;

  @ApiProperty({ example: '10001' })
  @IsString()
  @IsNotEmpty()
  billPostalcode: string;

  @ApiProperty({ example: 'bill@example.com' })
  @IsEmail()
  @IsNotEmpty()
  billEmail: string;

  @ApiProperty({ example: '1234567890' })
  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @ApiProperty({ example: 'Shipping Co' })
  @IsString()
  @IsNotEmpty()
  shipCompany: string;

  @ApiProperty({ example: '456 Ship St' })
  @IsString()
  @IsNotEmpty()
  shipAddress1: string;

  @ApiProperty({ example: 'Jersey City' })
  @IsString()
  @IsNotEmpty()
  shipCity: string;

  @ApiProperty({ example: 'NJ' })
  @IsString()
  @IsNotEmpty()
  shipState: string;

  @ApiProperty({ example: '07302' })
  @IsString()
  @IsNotEmpty()
  shipPostalcode: string;

  @ApiProperty({ enum: ShippingMethod, example: ShippingMethod.DELIVERY })
  @IsEnum(ShippingMethod)
  @IsNotEmpty()
  shippingMethod: ShippingMethod;

  @ApiProperty({ example: 'Please leave at the door', required: false })
  @IsString()
  @IsOptional()
  sessionNote?: string;
}
