import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, MinLength } from 'class-validator';
import { UserRole } from '../../user/entities/user.entity';

export class AdminRegisterDto {
  @ApiProperty({ example: 'admin@example.com' })
  @IsEmail({}, { message: 'Please provide a valid email.' })
  @IsNotEmpty()
  email!: string;

  @ApiProperty({ example: 'StrongPass1!' })
  @IsNotEmpty()
  @MinLength(8, { message: 'Password must be at least 8 characters.' })
  password!: string;

  @ApiProperty({ enum: [UserRole.ADMIN, UserRole.SUPERADMIN], example: UserRole.ADMIN })
  @IsEnum([UserRole.ADMIN, UserRole.SUPERADMIN], { message: 'Role must be admin or superadmin.' })
  role!: UserRole.ADMIN | UserRole.SUPERADMIN;
}

export class AdminLoginDto {
  @ApiProperty({ example: 'admin@example.com' })
  @IsEmail({}, { message: 'Please provide a valid email.' })
  @IsNotEmpty()
  email!: string;

  @ApiProperty({ example: 'StrongPass1!' })
  @IsNotEmpty()
  password!: string;
}
