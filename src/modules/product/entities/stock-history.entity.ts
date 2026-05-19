import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

export enum StockTransactionType {
  SALE = 'SALE',
  RETURN = 'RETURN',
  ADJUSTMENT = 'ADJUSTMENT',
  RESTOCK = 'RESTOCK'
}

@Entity('stock_history')
export class StockHistory {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ name: 'product_id' })
  productId!: string;

  @Column({ name: 'order_id', nullable: true })
  orderId!: string;

  @Column({ type: 'int' })
  change!: number; // e.g., -5 for a sale

  @Column({ type: 'int', name: 'resulting_stock' })
  resultingStock!: number;

  @Column({
    type: 'enum',
    enum: StockTransactionType,
    default: StockTransactionType.SALE
  })
  type!: StockTransactionType;

  @Column({ name: 'performed_by', nullable: true })
  performedBy!: string; // worker_id

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
