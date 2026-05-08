import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { OrderTimeline } from './entities/order-timeline.entity';
import { CartService } from './services/cart.service';
import { AddressService } from './services/address.service';
import { CheckoutService } from './services/checkout.service';
import { OrdersService } from './services/orders.service';
import { CartController } from './controllers/cart.controller';
import { AddressController } from './controllers/address.controller';
import { CheckoutController } from './controllers/checkout.controller';
import { Product } from '../product/entities/product.entity';
import { ProductModule } from '../product/product.module';
import { PaymentModule } from '../payment/payment.module';
import { OrderRepository } from './repositories/order.repository';
import { OrderItemRepository } from './repositories/order-item.repository';
import { OrderTimelineRepository } from './repositories/order-timeline.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem, OrderTimeline, Product]),
    PaymentModule,
    ProductModule,
  ],
  controllers: [
    CartController,
    AddressController,
    CheckoutController,
  ],
  providers: [
    CartService,
    AddressService,
    CheckoutService,
    OrdersService,
    OrderRepository,
    OrderItemRepository,
    OrderTimelineRepository,
  ],
  exports: [
    OrdersService,
    OrderRepository,
    OrderItemRepository,
    OrderTimelineRepository,
  ],
})
export class OrderModule {}
