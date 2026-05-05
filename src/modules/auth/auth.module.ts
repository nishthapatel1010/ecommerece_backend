import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { User } from '../user/entities/user.entity';
import { BuyerRequest } from '../user/entities/buyer-request.entity';
import { AuthToken } from '../user/entities/auth-token.entity';
import { AdminModule } from '../admin/admin.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, BuyerRequest, AuthToken]),
    JwtModule.registerAsync({
      global: true,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: configService.get<string>('JWT_EXPIRES_IN') as any },
      }),
    }),
    AdminModule,
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
