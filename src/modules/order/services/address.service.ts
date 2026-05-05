import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../entities/order.entity';
import { SaveAddressDto } from '../dto/address.dto';

@Injectable()
export class AddressService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {}

  async saveAddress(userId: string, dto: SaveAddressDto): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { userId, status: 'pending' },
    });

    if (!order) {
      throw new NotFoundException('No pending cart found for this user');
    }

    // Map DTO to Order entity
    order.billCompany = dto.billCompany;
    order.billAddress1 = dto.billAddress1;
    order.billCity = dto.billCity;
    order.billState = dto.billState;
    order.billPostalcode = dto.billPostalcode;
    order.billEmail = dto.billEmail;
    order.phoneNumber = dto.phoneNumber;

    order.shipCompany = dto.shipCompany;
    order.shipAddress1 = dto.shipAddress1;
    order.shipCity = dto.shipCity;
    order.shipState = dto.shipState;
    order.shipPostalcode = dto.shipPostalcode;

    order.shippingMethod = dto.shippingMethod;
    order.sessionNote = dto.sessionNote || order.sessionNote;

    return this.orderRepository.save(order);
  }

  async getAddress(userId: string) {
    const order = await this.orderRepository.findOne({
      where: { userId, status: 'pending' },
      select: [
        'billCompany', 'billAddress1', 'billCity', 'billState', 'billPostalcode', 'billEmail', 'phoneNumber',
        'shipCompany', 'shipAddress1', 'shipCity', 'shipState', 'shipPostalcode',
        'shippingMethod', 'sessionNote'
      ]
    });

    if (!order) {
      return {
        billCompany: null,
        billAddress1: null,
        billCity: null,
        billState: null,
        billPostalcode: null,
        billEmail: null,
        phoneNumber: null,
        shipCompany: null,
        shipAddress1: null,
        shipCity: null,
        shipState: null,
        shipPostalcode: null,
        shippingMethod: null,
        sessionNote: null,
      };
    }

    return order;
  }
}
