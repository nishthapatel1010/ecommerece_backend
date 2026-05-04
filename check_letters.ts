import { AppDataSource } from './src/database/data-source';
import { Product } from './src/modules/product/entities/product.entity';

async function check() {
  await AppDataSource.initialize();
  const repo = AppDataSource.getRepository(Product);
  const letters = await repo
    .createQueryBuilder('product')
    .select('UPPER(LEFT(TRIM(product.name), 1))', 'letter')
    .addSelect('COUNT(*)', 'count')
    .groupBy('letter')
    .orderBy('letter', 'ASC')
    .getRawMany();
  
  console.log('Letter counts in DB:');
  console.log(letters);
  await AppDataSource.destroy();
}

check();
