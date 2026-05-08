import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { User, UserRole, UserStatus } from '../../user/entities/user.entity';
import { BuyerRequestStatus } from '../../user/entities/buyer-request.entity';
import { BuyerRegisterDto } from '../dto/buyer-register.dto';
import { BuyerLoginDto } from '../dto/buyer-login.dto';
import { AdminRegisterDto, AdminLoginDto } from '../dto/admin-auth.dto';
import { AdminService } from '../../admin/services/admin.service';
import { UserRepository } from '../../user/repositories/user.repository';
import { BuyerRequestRepository } from '../../user/repositories/buyer-request.repository';
import { AuthTokenRepository } from '../../user/repositories/auth-token.repository';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly buyerRequestRepo: BuyerRequestRepository,
    private readonly authTokenRepo: AuthTokenRepository,
    private readonly jwtService: JwtService,
    private readonly adminService: AdminService,
    private readonly configService: ConfigService,
  ) { }

  async adminRegister(dto: AdminRegisterDto) {
    const exists = await this.userRepo.findOne({ where: { email: dto.email } });
    if (exists) throw new BadRequestException('Email already registered.');

    const hashed = await bcrypt.hash(dto.password, 10);
    const user = this.userRepo.create({
      email: dto.email,
      password: hashed,
      role: dto.role,
      status: UserStatus.ACTIVE,
    });
    await this.userRepo.save(user);

    const tokens = await this.generateTokenPair(user);
    return {
      success: true,
      message: `${dto.role} registered successfully.`,
      data: {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          status: user.status,
          created_at: user.created_at,
        },
        ...tokens,
      },
    };
  }

  async adminLogin(dto: AdminLoginDto) {
    const user = await this.userRepo.findOne({
      where: [
        { email: dto.email, role: UserRole.ADMIN },
        { email: dto.email, role: UserRole.SUPERADMIN },
      ],
    });
    if (!user) throw new UnauthorizedException('Invalid credentials.');

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials.');

    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('Your account is inactive.');
    }

    const tokens = await this.generateTokenPair(user);
    return {
      success: true,
      message: 'Login successful.',
      data: {
        user: { id: user.id, email: user.email, role: user.role },
        ...tokens,
      },
    };
  }

  async buyerRegister(dto: BuyerRegisterDto) {
    if (dto.password !== dto.confirm_password) {
      throw new BadRequestException('The password and confirmation password do not match.');
    }

    const exists = await this.userRepo.findOne({ where: { email: dto.email } });
    if (exists) throw new BadRequestException('Email already registered.');

    const hashed = await bcrypt.hash(dto.password, 10);
    const user = this.userRepo.create({
      email: dto.email,
      password: hashed,
      role: UserRole.BUYER,
      status: UserStatus.PENDING,
    });
    await this.userRepo.save(user);

    const request = this.buyerRequestRepo.create({
      user_id: user.id,
      company_name: dto.company_name,
      address: dto.address,
      city: dto.city,
      state: dto.state,
      zipcode: dto.zipcode,
      company_phone: dto.company_phone,
      status: BuyerRequestStatus.PENDING,
    });
    await this.buyerRequestRepo.save(request);

    let message = 'Registration successful. Awaiting admin approval.';
    let isApproved = false;

    if (this.configService.get<string>('AUTO_APPROVE_BUYERS') === 'true') {
      await this.adminService.approveBuyer(user.id);
      message = 'Registration successful. Auto-approved by system.';
      isApproved = true;
    }
    return {
      success: true,
      message,
      data: {
        id: user.id,
        email: user.email,
        role: user.role,
        status: isApproved ? UserStatus.ACTIVE : user.status,
        company_name: request.company_name,
        created_at: user.created_at,
      },
    };
  }

  async buyerLogin(dto: BuyerLoginDto) {
    const { email, password, cid } = dto;

    if ((password && cid) || (!password && !cid)) {
      throw new BadRequestException('Please provide either a password or a CID code, but not both.');
    }

    const user = await this.userRepo.findOne({ where: { email, role: UserRole.BUYER } });
    if (!user) throw new UnauthorizedException('Invalid credentials.');

    if (password) {
      const valid = await bcrypt.compare(password, user.password);
      if (!valid) throw new UnauthorizedException('Invalid credentials.');
    } else if (cid) {
      if (user.cid !== cid) throw new UnauthorizedException('Invalid credentials.');
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('Your account is not approved yet.');
    }

    const tokens = await this.generateTokenPair(user);
    return {
      success: true,
      message: 'Login successful.',
      data: {
        user: { id: user.id, email: user.email, role: user.role, cid: user.cid },
        ...tokens,
      },
    };
  }

  async refreshToken(token: string) {
    let payload: any;
    try {
      const secret = this.configService.get<string>('JWT_REFRESH_SECRET');
      payload = this.jwtService.verify(token, { secret });
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token.');
    }

    const tokenRecord = await this.authTokenRepo.findOne({ where: { user_id: payload.id } });
    if (!tokenRecord) throw new UnauthorizedException('Refresh token not found.');

    const isMatch = await bcrypt.compare(token, tokenRecord.refresh_token);
    if (!isMatch) throw new UnauthorizedException('Refresh token mismatch.');

    if (new Date() > tokenRecord.expires_at) {
      await this.authTokenRepo.delete({ user_id: payload.id });
      throw new UnauthorizedException('Refresh token expired. Please login again.');
    }

    const user = await this.userRepo.findOne({ where: { id: payload.id } });
    if (!user) throw new UnauthorizedException('User not found.');

    await this.authTokenRepo.delete({ user_id: user.id });
    const tokens = await this.generateTokenPair(user);

    return {
      success: true,
      message: 'Token refreshed successfully.',
      data: tokens,
    };
  }

  async logout(userId: string) {
    await this.authTokenRepo.delete({ user_id: userId });
    return { success: true, message: 'Logged out successfully.' };
  }

  private async generateTokenPair(user: User) {
    const payload = { id: user.id, email: user.email, role: user.role };

    const access_token = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: this.configService.get<string>('JWT_EXPIRES_IN') as any,
    });

    const refresh_token = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') as any,
    });

    const hashed = await bcrypt.hash(refresh_token, 10);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.authTokenRepo.delete({ user_id: user.id });
    await this.authTokenRepo.save(
      this.authTokenRepo.create({
        user_id: user.id,
        refresh_token: hashed,
        expires_at: expiresAt,
      }),
    );

    return { access_token, refresh_token };
  }
}
