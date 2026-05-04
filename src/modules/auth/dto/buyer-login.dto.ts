import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class BuyerLoginDto {
  @ApiProperty({ example: '<email>' })
  @IsEmail()
  email!: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  password!: string;
}

export class BuyerLoginWithCodeDto {
  @ApiProperty({ example: '<email>' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'BWR-XXXXXX' })
  @IsNotEmpty()
  @IsString()
  cid!: string;
}
