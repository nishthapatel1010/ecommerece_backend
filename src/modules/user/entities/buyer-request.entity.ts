import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

export enum BuyerRequestStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Entity('buyer_requests')
export class BuyerRequest {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  user_id!: string;

  @OneToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column()
  company_name!: string;

  @Column({ type: 'text' })
  address!: string;

  @Column()
  city!: string;

  @Column()
  state!: string;

  @Column()
  zipcode!: string;

  @Column()
  company_phone!: string;

  @Column({
    type: 'enum',
    enum: BuyerRequestStatus,
    default: BuyerRequestStatus.PENDING,
  })
  status!: BuyerRequestStatus;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
