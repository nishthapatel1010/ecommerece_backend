import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class BuyerLoginDto {
  @ApiProperty({ example: 'buyer@example.com' })
  @IsEmail({}, { message: 'Please provide a valid email.' })
  @IsNotEmpty()
  email!: string;

  @ApiProperty({ example: 'password123', required: false })
  @IsOptional()
  @IsString()
  password?: string;

  @ApiProperty({ example: 'BWR-XXXXXX', required: false })
  @IsOptional()
  @IsString()
  cid?: string;
}
