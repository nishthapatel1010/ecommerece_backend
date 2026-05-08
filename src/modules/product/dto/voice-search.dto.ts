import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength, IsOptional, Min ,IsInt } from 'class-validator';
import { Type } from 'class-transformer';
import { Any } from 'typeorm';

export class VoiceSearchDto {
  @ApiProperty({
    description: 'The voice-to-text string to search for',
    example: 'search for Lakme brand',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  query!: string;

  @ApiPropertyOptional({ example: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty({ example: 30, default: 30 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;
}
