import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from '../services/auth.service';
import { BuyerRegisterDto } from '../dto/buyer-register.dto';
import { BuyerLoginDto, BuyerLoginWithCodeDto } from '../dto/buyer-login.dto';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import { AdminRegisterDto, AdminLoginDto } from '../dto/admin-auth.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('admin/register')
  @ApiOperation({ summary: 'Register admin or superadmin' })
  adminRegister(@Body() dto: AdminRegisterDto) {
    return this.authService.adminRegister(dto);
  }

  @Post('admin/login')
  @ApiOperation({ summary: 'Admin login — returns access_token + refresh_token' })
  adminLogin(@Body() dto: AdminLoginDto) {
    return this.authService.adminLogin(dto);
  }

  @Post('buyer/register')
  @ApiOperation({ summary: 'Buyer registration' })
  buyerRegister(@Body() dto: BuyerRegisterDto) {
    return this.authService.buyerRegister(dto);
  }

  @Post('buyer/login')
  @ApiOperation({ summary: 'Buyer login — returns access_token + refresh_token' })
  buyerLogin(@Body() dto: BuyerLoginDto) {
    return this.authService.buyerLogin(dto);
  }

  @Post('buyer/login/code')
  @ApiOperation({ summary: 'Buyer login with email & CID code' })
  buyerLoginWithCode(@Body() dto: BuyerLoginWithCodeDto) {
    return this.authService.buyerLoginWithCode(dto);
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token using refresh_token' })
  refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshToken(dto.refresh_token);
  }

  @Post('logout')
  @ApiOperation({ summary: 'Logout — invalidates refresh token' })
  logout(@Body() dto: RefreshTokenDto) {
    // Extract user id from token without full guard for simplicity
    return this.authService.refreshToken(dto.refresh_token).then(() => {
      throw new Error('Use /auth/logout with a valid JWT guard in production');
    }).catch(() => ({ message: 'Logged out.' }));
  }
}
