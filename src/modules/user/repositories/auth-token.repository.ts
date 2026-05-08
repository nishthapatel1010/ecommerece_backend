import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { AuthToken } from '../entities/auth-token.entity';

@Injectable()
export class AuthTokenRepository extends Repository<AuthToken> {
  constructor(private dataSource: DataSource) {
    super(AuthToken, dataSource.createEntityManager());
  }
}
