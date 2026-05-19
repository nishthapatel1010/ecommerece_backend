import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DataSource, In } from 'typeorm';
import { Order } from '../entities/order.entity';
import { OrderItem } from '../entities/order-item.entity';
import { Product } from '../../product/entities/product.entity';
import { StockHistory, StockTransactionType } from '../../product/entities/stock-history.entity';
import { PaymentsService } from '../../payment/services/payments.service';
import { OrderRepository } from '../repositories/order.repository';
import { ProductRepository } from '../../product/repositories/product.repository';

@Injectable()
export class CheckoutService {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly productRepository: ProductRepository,
    private readonly dataSource: DataSource,
    private readonly paymentsService: PaymentsService,
  ) {}

  async getSummary(userId: string) {
    const order = await this.orderRepository.findOne({
      where: { userId, status: 'pending' },
      relations: ['items'],
    });

    if (!order) {
      throw new NotFoundException('No pending cart found');
    }

    return {
      items: order.items.map((item) => ({
        productId: item.productId,
        name: item.name,
        qty: item.qty,
        unitPrice: Number(item.unitPrice),
        totalPrice: Number(item.totalPrice),
      })),
      itemCount: order.itemCount,
      totalAmount: Number(order.totalAmount),
      shippingMethod: order.shippingMethod,
    };
  }

  private generateOrderNumber(): string {
    const date = new Date();
    const datePart = date.toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD
    const randomPart = Math.random().toString(36).substring(2, 7).toUpperCase();
    return `ORD-${datePart}-${randomPart}`;
  }

  async checkout(userId: string) {
    const MAX_RETRIES = 3;
    let attempt = 0;

    while (attempt < MAX_RETRIES) {
      attempt++;
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      
      // Set a statement timeout for this specific transaction to prevent hanging locks
      // 5 seconds timeout
      await queryRunner.query('SET statement_timeout = 5000');
      
      await queryRunner.startTransaction();

      try {
        const order = await queryRunner.manager.findOne(Order, {
          where: { userId, status: 'pending' },
          relations: ['items'],
        });

        if (!order || !order.items || order.items.length === 0) {
          throw new BadRequestException('Cart is empty or not found');
        }

        if (!order.billAddress1 || !order.shipAddress1) {
          throw new BadRequestException('Billing and shipping addresses are required');
        }

        let grandTotal = 0;
        let totalQty = 0;

        // --- ATOMIC STOCK UPDATE (LEAN SECTION) ---
        for (const item of order.items) {
          const product = await queryRunner.manager.findOne(Product, {
            where: { id: item.productId },
            lock: { mode: 'pessimistic_write' },
          });

          if (!product || !product.available) {
            throw new BadRequestException(`Product ${item.name} is no longer available`);
          }

          if (product.stock < item.qty) {
            throw new BadRequestException(`Insufficient stock for product: ${item.name}`);
          }

          // Calculate price inside lock to ensure consistency if prices changed
          let currentUnitPrice = Number(product.basePrice);
          if (product.breakQty && item.qty >= product.breakQty && product.breakPrice) {
            currentUnitPrice = Number(product.breakPrice);
          }
          const currentTotalPrice = currentUnitPrice * item.qty;

          // Update Order Item
          item.unitPrice = currentUnitPrice;
          item.totalPrice = currentTotalPrice;
          await queryRunner.manager.save(OrderItem, item);

          // Update Product Stock
          product.stock -= item.qty;
          await queryRunner.manager.save(Product, product);

          // --- AUDIT LOGGING ---
          const history = queryRunner.manager.create(StockHistory, {
            productId: product.id,
            orderId: order.id,
            change: -item.qty,
            resultingStock: product.stock,
            type: StockTransactionType.SALE,
            performedBy: userId, // worker_id / user_id
          });
          await queryRunner.manager.save(StockHistory, history);

          grandTotal += currentTotalPrice;
          totalQty += item.qty;
        }

        order.totalAmount = grandTotal;
        order.itemCount = totalQty;
        order.status = 'placed';
        order.groupNo = this.generateOrderNumber();
        const savedOrder = await queryRunner.manager.save(Order, order);

        await queryRunner.commitTransaction();
        await queryRunner.release();

        // --- NON-ESSENTIAL LOGIC (AFTER COMMIT) ---
        try {
          await this.paymentsService.createPayment(savedOrder.id, savedOrder.totalAmount);
          // Potential place for: SendEmailNotification(savedOrder), TriggerWebhook(savedOrder), etc.
        } catch (paymentErr) {
          console.error(`Post-checkout payment record creation failed for order ${savedOrder.id}:`, paymentErr);
          // Note: In a production system, you might queue this for a background job if it fails.
        }

        return {
          message: 'Order placed successfully',
          orderId: savedOrder.id,
          orderNumber: savedOrder.groupNo,
          totalAmount: grandTotal,
        };

      } catch (err: any) {
        await queryRunner.rollbackTransaction();
        await queryRunner.release();

        // Retry on Deadlock (40P01) or Lock Timeout (55P03)
        const isRetryable = err.code === '40P01' || err.code === '55P03';
        if (isRetryable && attempt < MAX_RETRIES) {
          console.warn(`Retryable error ${err.code} detected on attempt ${attempt}. Retrying...`);
          await new Promise(res => setTimeout(res, 200 * attempt)); // Exponential backoff
          continue;
        }
        
        throw err;
      }
    }
  }

  async exportCartCsv(userId: string): Promise<string> {
    const order = await this.orderRepository.findOne({
      where: { userId, status: 'pending' },
      relations: ['items'],
    });

    if (!order || !order.items || order.items.length === 0) {
      throw new NotFoundException('No pending cart found or cart is empty');
    }

    const date = new Date().toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: '2-digit',
    });

    const sessionId = order.sessionId || order.id.substring(0, 8).toUpperCase();
    const billCo = order.billCompany || '';
    const shipCo = order.shipCompany || '';
    const shipAddr = order.shipAddress1 || '';
    const shipCity = order.shipCity || '';
    const shipState = order.shipState || '';
    const shipZip = order.shipPostalcode || '';
    const shipping = order.shippingMethod || '';

    const escape = (val: string | number | null | undefined) => {
      const str = String(val ?? '');
      return str.includes(',') ? `"${str.replace(/"/g, '""')}"` : str;
    };

    const lines: string[] = [];

    lines.push(`${escape(sessionId)},,${escape(date)}`);
    lines.push(`${escape(billCo)},Ship To:,${escape(shipCo)},${escape(shipAddr)},${escape(shipCity)},${escape(shipState)},,${escape(shipZip)}`);
    lines.push(`${escape(sessionId)},${escape(shipping)}`);
    lines.push('');

    lines.push('ItemNo,Description,Size,Promo,CaseUnit,Quantity,Unit,UnitPrice,Extended');

    const productIds = order.items.map((i) => i.productId).filter(Boolean);
    const products = await this.productRepository.find({
      where: { id: In(productIds) }
    });
    const productMap = new Map(products.map((p) => [p.id, p]));

    for (const item of order.items) {
      const product = productMap.get(item.productId);
      const sku = escape(item.sku);
      const name = escape(item.name);
      const size = escape(product?.size ?? '');
      const promo = '';
      const caseUnit = escape(product?.caseUnit ?? '');
      const qty = item.qty;
      const unit = escape(product?.unit ?? 'EA');
      const unitPrice = Number(item.unitPrice).toFixed(2);
      const extended = Number(item.totalPrice).toFixed(2);

      lines.push(`${sku},${name},${size},${promo},${caseUnit},${qty},${unit},${unitPrice},${extended}`);
    }

    return lines.join('\r\n');
  }
}
