import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Order } from '../entities/order.entity';

@Injectable()
export class OrderRepository extends Repository<Order> {
  constructor(private dataSource: DataSource) {
    super(Order, dataSource.createEntityManager());
  }

  /**
   * Fetches all orders with filters and pagination.
   */
  async findAllOrders(query: {
    status?: string;
    orderId?: string;
    page?: number;
    limit?: number;
  }) {
    const { status, orderId, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) where.status = status;
    if (orderId) where.id = orderId;

    const [items, total] = await this.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      take: limit,
      skip,
      relations: ['items'],
    });

    return {
      items,
      total,
      page,
      lastPage: Math.ceil(total / limit),
    };
  }
}
