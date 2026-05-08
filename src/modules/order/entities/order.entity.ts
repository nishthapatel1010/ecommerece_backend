// src/modules/order/entities/order.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  OneToOne,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  JoinColumn,
} from 'typeorm';
import { OrderItem } from './order-item.entity';
import { Payment } from '../../payment/entities/payment.entity';
import { OrderTimeline } from './order-timeline.entity';

export enum OrderStatus {
  PLACED = 'placed',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
}

export enum PaymentMethod {
  COD = 'COD',
  ONLINE = 'ONLINE',
}

@Entity('orders')
@Index(['userId', 'status'])
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @Column({ name: 'group_no', nullable: true })
  groupNo!: string;

  @Column({ name: 'session_id', nullable: true, unique: true })
  sessionId!: string;

  @Column({ name: 'item_count', type: 'int', default: 0 })
  itemCount!: number;

  @Column({
    name: 'total_amount',
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
  })
  totalAmount!: number;

  @Column({ name: 'bill_company', nullable: true })
  billCompany!: string;

  @Column({ name: 'bill_address1', nullable: true })
  billAddress1!: string;

  @Column({ name: 'bill_city', nullable: true })
  billCity!: string;

  @Column({ name: 'bill_state', nullable: true })
  billState!: string;

  @Column({ name: 'bill_postalcode', nullable: true })
  billPostalcode!: string;

  @Column({ name: 'bill_email', nullable: true })
  billEmail!: string;

  @Column({ name: 'phone_number', nullable: true })
  phoneNumber!: string;

  @Column({ name: 'ship_company', nullable: true })
  shipCompany!: string;

  @Column({ name: 'ship_address1', nullable: true })
  shipAddress1!: string;

  @Column({ name: 'ship_city', nullable: true })
  shipCity!: string;

  @Column({ name: 'ship_state', nullable: true })
  shipState!: string;

  @Column({ name: 'ship_postalcode', nullable: true })
  shipPostalcode!: string;

  @Column({ name: 'shipping_method', nullable: true })
  shippingMethod!: string;

  @Column({ name: 'session_note', type: 'text', nullable: true })
  sessionNote!: string;

  @Column({ default: OrderStatus.PLACED })
  status!: string;

  @Column({ name: 'payment_status', default: PaymentStatus.PENDING })
  paymentStatus!: string;

  @Column({ name: 'payment_method', default: PaymentMethod.COD })
  paymentMethod!: string;

  @Column({ name: 'tracking_number', nullable: true })
  trackingNumber!: string;

  @Column({ name: 'courier_name', nullable: true })
  courierName!: string;

  @OneToMany(() => OrderItem, (item) => item.order, {
    cascade: true,
  })
  items!: OrderItem[];

  @OneToOne(() => Payment, (p) => p.order, { cascade: true })
  payment!: Payment;

  @OneToMany(() => OrderTimeline, (t) => t.order)
  timeline!: OrderTimeline[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}