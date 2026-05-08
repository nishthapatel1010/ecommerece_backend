import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { BuyerRequest, BuyerRequestStatus } from '../entities/buyer-request.entity';

@Injectable()
export class BuyerRequestRepository extends Repository<BuyerRequest> {
  constructor(private dataSource: DataSource) {
    super(BuyerRequest, dataSource.createEntityManager());
  }

  /**
   * Fetches all pending buyer requests with user relations.
   */
  async findPendingRequests() {
    return this.find({
      where: { status: BuyerRequestStatus.PENDING },
      relations: ['user'],
      order: { created_at: 'DESC' },
    });
  }
}
