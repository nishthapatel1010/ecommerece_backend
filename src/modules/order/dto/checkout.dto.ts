// src/modules/cart/dto/checkout.dto.ts
import {
  IsString,
  IsEmail,
  IsOptional,
  IsIn,
} from 'class-validator';

export class CheckoutDto {
  // Billing
  @IsString()
  billCompany!: string;

  @IsString()
  billAddress1!: string;

  @IsString()
  billCity!: string;

  @IsString()
  billState!: string;

  @IsString()
  billPostalcode!: string;

  @IsEmail()
  billEmail !: string;

  @IsString()
  phoneNumber!: string;

  // Shipping
  @IsString()
  shipCompany!: string;

  @IsString()
  shipAddress1!: string;

  @IsString()
  shipCity!: string;

  @IsString()
  shipState!: string;

  @IsString()
  shipPostalcode!: string;

  // Shipping Method
  @IsIn(['delivery', 'trucking', 'pickup', 'ups'])
  shippingMethod!: string;

  // Note
  @IsOptional()
  @IsString()
  sessionNote?: string;
}