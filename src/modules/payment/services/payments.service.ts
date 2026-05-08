// src/modules/payment/services/payments.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Payment, PaymentStatus } from '../entities/payment.entity';
import { Order, OrderStatus, PaymentStatus as OrderPaymentStatus } from '../../order/entities/order.entity';
import { PaymentRepository } from '../repositories/payment.repository';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly paymentRepo: PaymentRepository,
    private readonly dataSource: DataSource,
  ) {}

  async createPayment(orderId: string, amount: number) {
    const payment = this.paymentRepo.create({
      orderId,
      amount,
      status: PaymentStatus.PENDING,
      method: 'COD',
    });
    return this.paymentRepo.save(payment);
  }

  async getAllPayments() {
    return this.paymentRepo.find({
      order: { createdAt: 'DESC' },
    });
  }

  async getPaymentById(id: string) {
    const payment = await this.paymentRepo.findOne({
      where: { id },
      relations: ['order'],
    });
    if (!payment) throw new NotFoundException('Payment record not found');
    return payment;
  }

  async collectCodPayment(orderId: string, adminId: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const order = await queryRunner.manager.findOne(Order, {
        where: { id: orderId },
        relations: ['payment'],
      });

      if (!order) throw new NotFoundException('Order not found');

      if (order.status !== OrderStatus.DELIVERED) {
        throw new BadRequestException('COD payment can only be collected after the order is delivered.');
      }

      if (order.paymentStatus === OrderPaymentStatus.PAID) {
        throw new BadRequestException('Payment has already been collected for this order.');
      }

      const payment = order.payment;
      if (!payment) throw new NotFoundException('Payment record not found for this order');

      payment.status = PaymentStatus.PAID;
      payment.paidAt = new Date();
      payment.collectedBy = adminId;
      await queryRunner.manager.save(Payment, payment);

      order.paymentStatus = OrderPaymentStatus.PAID;
      await queryRunner.manager.save(Order, order);

      await queryRunner.commitTransaction();
      return { message: 'COD payment collected successfully', orderId: order.id };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}
