import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { AdminController } from './controllers/admin.controller';
import { ProductAdminController } from './controllers/product.admin.controller';
import { AdminService } from './services/admin.service';
import { ProductAdminService } from './services/product.admin.service';
import { AdminOrdersController } from './controllers/order.admin.controller';
import { PaymentsController } from './controllers/payment.admin.controller';

import { User } from '../user/entities/user.entity';
import { BuyerRequest } from '../user/entities/buyer-request.entity';
import { BuyerProfile } from '../user/entities/buyer-profile.entity';
import { Product } from '../product/entities/product.entity';


import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { env } from '../../config/env';

import { UploadModule } from '../upload/upload.module';
import { OrderModule } from '../order/order.module';
import { PaymentModule } from '../payment/payment.module';
import { UserModule } from '../user/user.module';
import { ProductModule } from '../product/product.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, BuyerRequest, BuyerProfile,Product]),
    JwtModule.register({ secret: env.JWT_SECRET }),
    UploadModule,
    OrderModule,
    PaymentModule,
    UserModule,
    ProductModule,
  ],
  controllers: [AdminController, ProductAdminController, AdminOrdersController, PaymentsController],
  providers: [AdminService, JwtAuthGuard, RolesGuard,ProductAdminService],
  exports: [AdminService,ProductAdminService],
})
export class AdminModule {}
