
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { formatProductImage } from '../../../common/utils/cloudinary.util';

@Entity('products')
@Index(['name'])
@Index(['sku'], { unique: true })
@Index(['upc'])
@Index(['available'])
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;


  @Column({ unique: true })
  sku!: string;

  @Column({ nullable: true })
  upc!: string;

  @Column({ name: 'item_number', unique: true, nullable: true })
  itemNumber!: string;

  @Column({ name: 'image_url', nullable: true })
  imageUrl!: string;

  @Column({ name: 'image_public_id', nullable: true })
  imagePublicId!: string;

  get thumbnail(): string {
    return formatProductImage(this.imagePublicId, 'thumbnail');
  }

  get grid(): string {
    return formatProductImage(this.imagePublicId, 'grid');
  }

  get detail(): string {
    return formatProductImage(this.imagePublicId, 'detail');
  }

  @Column({ nullable: true })
  size!: string;

  @Column({ name: 'case_unit', nullable: true })
  caseUnit!: string;

  @Column({ nullable: true })
  unit!: string;

  @Column('decimal', { name: 'base_price', precision: 10, scale: 2, nullable: true })
  basePrice!: number;

  @Column('int', { name: 'break_qty', nullable: true })
  breakQty!: number;

  @Column('decimal', { name: 'break_price', precision: 10, scale: 2, nullable: true })
  breakPrice!: number;

  @Column('int', { name: 'min_qty', nullable: true })
  minQty!: number;

  @Column('int', { default: 0 })
  stock!: number;

  @Column({ default: true })
  available!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}