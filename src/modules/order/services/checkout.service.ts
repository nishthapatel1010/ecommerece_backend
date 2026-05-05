import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Order } from '../entities/order.entity';
import { OrderItem } from '../entities/order-item.entity';
import { Product } from '../../product/entities/product.entity';

@Injectable()
export class CheckoutService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly dataSource: DataSource,
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
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Get pending order
      const order = await queryRunner.manager.findOne(Order, {
        where: { userId, status: 'pending' },
        relations: ['items'],
      });

      if (!order || !order.items || order.items.length === 0) {
        throw new BadRequestException('Cart is empty or not found');
      }

      // 2. Validate Address
      if (!order.billAddress1 || !order.shipAddress1) {
        throw new BadRequestException('Billing and shipping addresses are required');
      }

      let grandTotal = 0;
      let totalQty = 0;

      // 3. Process each item
      for (const item of order.items) {
        // Lock product row
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

        // 4. Recalculate Price
        let currentUnitPrice = Number(product.basePrice);
        if (product.breakQty && item.qty >= product.breakQty && product.breakPrice) {
          currentUnitPrice = Number(product.breakPrice);
        }

        const currentTotalPrice = currentUnitPrice * item.qty;

        // Update item details
        item.unitPrice = currentUnitPrice;
        item.totalPrice = currentTotalPrice;
        await queryRunner.manager.save(OrderItem, item);

        // Deduct stock
        product.stock -= item.qty;
        await queryRunner.manager.save(Product, product);

        grandTotal += currentTotalPrice;
        totalQty += item.qty;
      }

      // 5. Update Order
      order.totalAmount = grandTotal;
      order.itemCount = totalQty;
      order.status = 'placed';
      order.groupNo = this.generateOrderNumber(); // <--- Assign readable Order Number
      const savedOrder = await queryRunner.manager.save(Order, order);

      await queryRunner.commitTransaction();

      return {
        message: 'Order placed successfully',
        orderId: savedOrder.id,
        orderNumber: savedOrder.groupNo,
        totalAmount: grandTotal,
      };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
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

    // Header rows — matches the screenshot format
    lines.push(`${escape(sessionId)},,${escape(date)}`);
    lines.push(`${escape(billCo)},Ship To:,${escape(shipCo)},${escape(shipAddr)},${escape(shipCity)},${escape(shipState)},,${escape(shipZip)}`);
    lines.push(`${escape(sessionId)},${escape(shipping)}`);
    lines.push('');

    // Column headers
    lines.push('ItemNo,Description,Size,Promo,CaseUnit,Quantity,Unit,UnitPrice,Extended');

    // Load product details for size/caseUnit/unit
    const productIds = order.items.map((i) => i.productId).filter(Boolean);
    const products = await this.productRepository.findByIds(productIds);
    const productMap = new Map(products.map((p) => [p.id, p]));

    // Item rows
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
