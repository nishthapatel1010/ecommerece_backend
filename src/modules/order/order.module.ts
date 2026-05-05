import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { CartService } from './services/cart.service';
import { AddressService } from './services/address.service';
import { CheckoutService } from './services/checkout.service';
import { CartController } from './controllers/cart.controller';
import { AddressController } from './controllers/address.controller';
import { CheckoutController } from './controllers/checkout.controller';
import { Product } from '../product/entities/product.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem, Product]),
    AuthModule,
  ],
  controllers: [CartController, AddressController, CheckoutController],
  providers: [CartService, AddressService, CheckoutService],
})
export class OrderModule {}
