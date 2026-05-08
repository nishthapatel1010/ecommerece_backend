import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { OrderTimeline } from '../entities/order-timeline.entity';

@Injectable()
export class OrderTimelineRepository extends Repository<OrderTimeline> {
  constructor(private dataSource: DataSource) {
    super(OrderTimeline, dataSource.createEntityManager());
  }
}
