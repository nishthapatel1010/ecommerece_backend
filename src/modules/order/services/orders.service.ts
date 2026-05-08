// src/modules/order/services/orders.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Order, OrderStatus } from '../entities/order.entity';
import { OrderTimeline } from '../entities/order-timeline.entity';
import { OrderRepository } from '../repositories/order.repository';
import { OrderTimelineRepository } from '../repositories/order-timeline.repository';
import { ProductRepository } from '../../product/repositories/product.repository';

@Injectable()
export class OrdersService {
  constructor(
    private readonly orderRepo: OrderRepository,
    private readonly productRepo: ProductRepository,
    private readonly timelineRepo: OrderTimelineRepository,
    private readonly dataSource: DataSource,
  ) {}

  async getAllOrders(query: {
    status?: string;
    email?: string;
    orderId?: string;
    page?: number;
    limit?: number;
  }) {
    return this.orderRepo.findAllOrders(query);
  }

  async getOrderDetails(id: string) {
    const order = await this.orderRepo.findOne({
      where: { id },
      relations: ['items', 'payment', 'timeline'],
    });
    if (!order) throw new NotFoundException('Order not found');
    
    return {
      ...order,
      payment: order.payment ? [order.payment] : [],
    };
  }

  async updateStatus(id: string, newStatus: OrderStatus, adminId: string, payload?: any) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const order = await queryRunner.manager.findOne(Order, {
        where: { id },
        relations: ['items'],
      });

      if (!order) throw new NotFoundException('Order not found');

      this.validateTransition(order.status as OrderStatus, newStatus);

      if (newStatus === OrderStatus.SHIPPED) {
        if (!payload?.trackingNumber || !payload?.courierName) {
          throw new BadRequestException('Tracking number and courier name are required for shipping.');
        }
        order.trackingNumber = payload.trackingNumber;
        order.courierName = payload.courierName;
      }

      if (newStatus === OrderStatus.CANCELLED) {
        await this.restoreStock(queryRunner, order);
      }

      order.status = newStatus;
      await queryRunner.manager.save(Order, order);

      const timeline = this.timelineRepo.create({
        orderId: id,
        status: newStatus,
        note: payload?.note || `Status updated to ${newStatus}`,
        performedBy: adminId,
      });
      await queryRunner.manager.save(OrderTimeline, timeline);

      await queryRunner.commitTransaction();
      return order;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  private validateTransition(current: OrderStatus, next: OrderStatus) {
    const transitions: Record<OrderStatus, OrderStatus[]> = {
      [OrderStatus.PLACED]: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
      [OrderStatus.PROCESSING]: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
      [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED],
      [OrderStatus.DELIVERED]: [],
      [OrderStatus.CANCELLED]: [],
    };

    if (!transitions[current]?.includes(next)) {
      throw new BadRequestException(`Invalid status transition from ${current} to ${next}`);
    }
  }

  private async restoreStock(queryRunner: any, order: Order) {
    for (const item of order.items) {
      const product = await queryRunner.manager.findOne('Product', { where: { id: item.productId } });
      if (product) {
        (product as any).stock += item.qty;
        await queryRunner.manager.save('Product', product);
      }
    }
  }
}
