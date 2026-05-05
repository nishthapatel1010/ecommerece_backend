import { DataSource } from 'typeorm';
import { Product } from '../src/modules/product/entities/product.entity';
import { User, UserRole } from '../src/modules/user/entities/user.entity';
import * as dotenv from 'dotenv';

dotenv.config();

async function checkData() {
  const dataSource = new DataSource({
    type: 'postgres',
    url: process.env.DB_URL,
    ssl: { rejectUnauthorized: false },
    entities: [Product, User],
  });

  await dataSource.initialize();
  
  // Ensure stock column exists
  await dataSource.query(`ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "stock" integer DEFAULT 0`);

  const product = await dataSource.getRepository(Product).findOne({ where: { available: true } });
  const buyer = await dataSource.getRepository(User).findOne({ where: { role: UserRole.BUYER } });

  console.log('--- Data Check ---');
  console.log('Product Found:', product ? `${product.name} (${product.id})` : 'NONE');
  console.log('Buyer Found:', buyer ? buyer.email : 'NONE');

  if (product && (product.stock === null || product.stock === 0)) {
      console.log('Product has 0 stock. Adding 100 stock for testing.');
      product.stock = 100;
      await dataSource.getRepository(Product).save(product);
  }

  await dataSource.destroy();
}

checkData().catch(console.error);
