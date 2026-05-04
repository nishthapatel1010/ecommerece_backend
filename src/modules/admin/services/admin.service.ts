import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserStatus } from '../../user/entities/user.entity';
import { BuyerRequest, BuyerRequestStatus } from '../../user/entities/buyer-request.entity';
import { BuyerProfile } from '../../user/entities/buyer-profile.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(BuyerRequest) private readonly buyerRequestRepo: Repository<BuyerRequest>,
    @InjectRepository(BuyerProfile) private readonly profileRepo: Repository<BuyerProfile>,
  ) {}

  async getAllBuyerRequests() {
    const requests = await this.buyerRequestRepo.find({
      where: { status: BuyerRequestStatus.PENDING },
      relations: ['user'],
      order: { created_at: 'DESC' },
    });

    return {
      success: true,
      message: 'Buyer requests fetched successfully.',
      data: requests.map((r) => ({
        id: r.id,
        status: r.status,
        company_name: r.company_name,
        address: r.address,
        city: r.city,
        state: r.state,
        zipcode: r.zipcode,
        company_phone: r.company_phone,
        created_at: r.created_at,
        user: {
          id: r.user.id,
          email: r.user.email,
          role: r.user.role,
          status: r.user.status,
        },
      })),
      total: requests.length,
    };
  }

  async getBuyerRequestById(id: string) {
    const r = await this.buyerRequestRepo.findOne({ where: { user_id: id }, relations: ['user'] });
    if (!r) throw new NotFoundException('Buyer request not found.');

    return {
      success: true,
      message: 'Buyer request fetched successfully.',
      data: {
        id: r.id,
        status: r.status,
        company_name: r.company_name,
        address: r.address,
        city: r.city,
        state: r.state,
        zipcode: r.zipcode,
        company_phone: r.company_phone,
        created_at: r.created_at,
        user: {
          id: r.user.id,
          email: r.user.email,
          role: r.user.role,
          status: r.user.status,
        },
      },
    };
  }

  async approveBuyer(id: string) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found.');

    const request = await this.buyerRequestRepo.findOne({ where: { user_id: id } });
    if (!request) throw new NotFoundException('Buyer request not found.');

    const cid = this.generateCid();
    user.status = UserStatus.ACTIVE;
    user.cid = cid;
    await this.userRepo.save(user);

    request.status = BuyerRequestStatus.APPROVED;
    await this.buyerRequestRepo.save(request);

    const profile = this.profileRepo.create({
      user_id: user.id,
      company_name: request.company_name,
      address: request.address,
      city: request.city,
      state: request.state,
      zipcode: request.zipcode,
      company_phone: request.company_phone,
    });
    await this.profileRepo.save(profile);

    return {
      success: true,
      message: 'Buyer approved successfully.',
      data: {
        user_id: user.id,
        email: user.email,
        status: user.status,
        cid,
        profile: {
          company_name: profile.company_name,
          city: profile.city,
          state: profile.state,
        },
      },
    };
  }

  async rejectBuyer(id: string) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found.');

    const request = await this.buyerRequestRepo.findOne({ where: { user_id: id } });
    if (!request) throw new NotFoundException('Buyer request not found.');

    user.status = UserStatus.REJECTED;
    await this.userRepo.save(user);

    request.status = BuyerRequestStatus.REJECTED;
    await this.buyerRequestRepo.save(request);

    return {
      success: true,
      message: 'Buyer rejected successfully.',
      data: {
        user_id: user.id,
        email: user.email,
        status: user.status,
      },
    };
  }

  private generateCid(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const code = Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    return `BWR-${code}`;
  }
}
