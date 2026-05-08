// src/modules/order/entities/order-timeline.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Order } from './order.entity';

@Entity('order_timelines')
export class OrderTimeline {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'order_id', type: 'uuid' })
  orderId!: string;

  @ManyToOne(() => Order, (order) => order.timeline, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order!: Order;

  @Column()
  status!: string;

  @Column({ type: 'text', nullable: true })
  note!: string;

  @Column({ name: 'performed_by', type: 'uuid', nullable: true })
  performedBy!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
