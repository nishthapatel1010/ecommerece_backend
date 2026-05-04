// src/modules/cart/services/cart.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Order } from '../entities/order.entity';
import { OrderItem } from '../entities/order-item.entity';
import { AddToCartDto } from '../dto/add-to-cart.dto';
import { UpdateCartItemDto } from '../dto/update-cart-item.dto';
import { Product } from '../../product/entities/product.entity';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,

    @InjectRepository(OrderItem)
    private readonly orderItemRepo: Repository<OrderItem>,

    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
  ) {}

  private async getOrCreateCart(userId: string): Promise<Order> {
    let order = await this.orderRepo.findOne({
      where: { userId, status: 'pending' },
    });

    if (!order) {
      order = this.orderRepo.create({
        userId,
        status: 'pending',
      });
      await this.orderRepo.save(order);
    }

    return order;
  }

  private async recalc(orderId: string) {
    const items = await this.orderItemRepo.find({
      where: { orderId },
      select: ['qty', 'totalPrice'],
    });

    const itemCount = items.reduce((sum, i) => sum + i.qty, 0);
    const totalAmount = items.reduce(
      (sum, i) => sum + Number(i.totalPrice),
      0,
    );

    await this.orderRepo.update(orderId, {
      itemCount,
      totalAmount,
    });
  }

  async getCart(userId: string) {
    const order = await this.orderRepo.findOne({
      where: { userId, status: 'pending' },
      relations: ['items'],
    });

    if (!order) {
      return {
        items: [],
        itemCount: 0,
        totalAmount: 0,
      };
    }

    return order;
  }

  async addToCart(userId: string, dto: AddToCartDto) {
    const product = await this.productRepo.findOne({
      where: { id: dto.productId },
    });

    if (!product) throw new NotFoundException('Product not found');

    if (!product.available)
      throw new BadRequestException('Product not available');

    if (dto.quantity < product.minQty)
      throw new BadRequestException(
        `Minimum quantity is ${product.minQty}`,
      );

    const order = await this.getOrCreateCart(userId);

    let item = await this.orderItemRepo.findOne({
      where: {
        orderId: order.id,
        productId: dto.productId,
      },
    });

    const newQty = item ? item.qty + dto.quantity : dto.quantity;

    const unitPrice =
      newQty >= product.breakQty
        ? product.breakPrice
        : product.basePrice;

    const totalPrice = newQty * unitPrice;

    if (item) {
      item.qty = newQty;
      item.unitPrice = unitPrice;
      item.totalPrice = totalPrice;
      await this.orderItemRepo.save(item);
    } else {
      item = this.orderItemRepo.create({
        orderId: order.id,
        productId: product.id,
        name: product.name,
        sku: product.sku,
        price: product.basePrice,
        qty: newQty,
        unitPrice,
        totalPrice,
      });

      await this.orderItemRepo.save(item);
    }

    await this.recalc(order.id);

    return { message: 'Item added to cart' };
  }

  async updateCartItem(
    userId: string,
    itemId: string,
    dto: UpdateCartItemDto,
  ) {
    const item = await this.orderItemRepo.findOne({
      where: { id: itemId },
    });

    if (!item) throw new NotFoundException('Item not found');

    const order = await this.orderRepo.findOne({
      where: { id: item.orderId },
    });

    if (!order || order.userId !== userId)
      throw new BadRequestException('Invalid cart');

    const product = await this.productRepo.findOne({
      where: { id: item.productId },
    });

    if (!product) throw new NotFoundException('Product not found');

    if (dto.quantity < product.minQty)
      throw new BadRequestException(
        `Minimum quantity is ${product.minQty}`,
      );

    const unitPrice =
      dto.quantity >= product.breakQty
        ? product.breakPrice
        : product.basePrice;

    const totalPrice = dto.quantity * unitPrice;

    item.qty = dto.quantity;
    item.unitPrice = unitPrice;
    item.totalPrice = totalPrice;

    await this.orderItemRepo.save(item);

    await this.recalc(order.id);

    return { message: 'Cart item updated' };
  }

  async removeCartItem(userId: string, itemId: string) {
    const item = await this.orderItemRepo.findOne({
      where: { id: itemId },
    });

    if (!item) throw new NotFoundException('Item not found');

    const order = await this.orderRepo.findOne({
      where: { id: item.orderId },
    });

    if (!order || order.userId !== userId)
      throw new BadRequestException('Invalid cart');

    await this.orderItemRepo.delete(itemId);

    await this.recalc(order.id);

    return { message: 'Item removed' };
  }

  async clearCart(userId: string) {
    const order = await this.orderRepo.findOne({
      where: { userId, status: 'pending' },
    });

    if (!order) return { message: 'Cart already empty' };

    await this.orderItemRepo.delete({ orderId: order.id });

    await this.recalc(order.id);

    return { message: 'Cart cleared' };
  }
}