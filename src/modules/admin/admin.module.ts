import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { AdminController } from './controllers/admin.controller';
import { ProductAdminController } from './controllers/product.admin.controller';
import { AdminService } from './services/admin.service';
import { ProductAdminService } from './services/product.admin.service';

import { User } from '../user/entities/user.entity';
import { BuyerRequest } from '../user/entities/buyer-request.entity';
import { BuyerProfile } from '../user/entities/buyer-profile.entity';
import { Product } from '../product/entities/product.entity';


import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { env } from '../../config/env';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, BuyerRequest, BuyerProfile,Product]),
    JwtModule.register({ secret: env.JWT_SECRET }),
  ],
  controllers: [AdminController, ProductAdminController],
  providers: [AdminService, JwtAuthGuard, RolesGuard,ProductAdminService],
  exports: [AdminService,ProductAdminService],
})
export class AdminModule {}
