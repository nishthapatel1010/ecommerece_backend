import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { BuyerRequest } from './entities/buyer-request.entity';
import { BuyerProfile } from './entities/buyer-profile.entity';
import { AuthToken } from './entities/auth-token.entity';
import { UserRepository } from './repositories/user.repository';
import { BuyerRequestRepository } from './repositories/buyer-request.repository';
import { BuyerProfileRepository } from './repositories/buyer-profile.repository';
import { AuthTokenRepository } from './repositories/auth-token.repository';

@Module({
  imports: [TypeOrmModule.forFeature([User, BuyerRequest, BuyerProfile, AuthToken])],
  providers: [
    UserRepository,
    BuyerRequestRepository,
    BuyerProfileRepository,
    AuthTokenRepository,
  ],
  exports: [
    UserRepository,
    BuyerRequestRepository,
    BuyerProfileRepository,
    AuthTokenRepository,
  ],
})
export class UserModule {}
