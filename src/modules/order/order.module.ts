import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { CartService } from './services/cart.service';
import { CartController } from './controllers/cart.controller';
import { Product } from '../product/entities/product.entity';


@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderItem, Product])],
  controllers: [CartController],
  providers: [CartService],
})
export class OrderModule {}
