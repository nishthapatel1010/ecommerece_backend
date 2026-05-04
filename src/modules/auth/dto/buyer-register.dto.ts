import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail, IsNotEmpty, IsString, MinLength, MaxLength, Matches,
} from 'class-validator';

export class BuyerRegisterDto {
  @ApiProperty({ example: 'buyer@example.com' })
  @IsEmail({}, { message: 'Please provide a valid email.' })
  @IsNotEmpty({ message: 'Email is required.' })
  email!: string;

  @ApiProperty({ example: 'Beauty Co.' })
  @IsString()
  @IsNotEmpty({ message: 'Company name is required.' })
  @MinLength(2, { message: 'Company name must be at least 2 characters.' })
  @MaxLength(100)
  company_name!: string;

  @ApiProperty({ example: '123 Main St' })
  @IsString()
  @IsNotEmpty({ message: 'Address is required.' })
  @MinLength(5, { message: 'Address must be at least 5 characters.' })
  address!: string;

  @ApiProperty({ example: 'New York' })
  @IsString()
  @IsNotEmpty({ message: 'City is required.' })
  city!: string;

  @ApiProperty({ example: 'NY' })
  @IsString()
  @IsNotEmpty({ message: 'State is required.' })
  state!: string;

  @ApiProperty({ example: '10001' })
  @IsString()
  @IsNotEmpty({ message: 'Zipcode is required.' })
  @Matches(/^\d{5}(-\d{4})?$/, { message: 'Zipcode must be a valid format (e.g. 10001 or 10001-1234).' })
  zipcode!: string;

  @ApiProperty({ example: '+11234567890' })
  @IsString()
  @IsNotEmpty({ message: 'Company phone is required.' })
  @Matches(/^\+?[1-9]\d{7,14}$/, { message: 'Please provide a valid phone number.' })
  company_phone!: string;

  @ApiProperty({ example: 'StrongPass1!' })
  @IsNotEmpty({ message: 'Password is required.' })
  @MinLength(8, { message: 'Password must be at least 8 characters.' })
  @Matches(/^(?=.*[A-Z])(?=.*\d)/, { message: 'Password must contain at least one uppercase letter and one number.' })
  password!: string;

  @ApiProperty({ example: 'StrongPass1!' })
  @IsNotEmpty({ message: 'Confirm password is required.' })
  confirm_password!: string;
}
