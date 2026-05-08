import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { BuyerProfile } from '../entities/buyer-profile.entity';

@Injectable()
export class BuyerProfileRepository extends Repository<BuyerProfile> {
  constructor(private dataSource: DataSource) {
    super(BuyerProfile, dataSource.createEntityManager());
  }
}
