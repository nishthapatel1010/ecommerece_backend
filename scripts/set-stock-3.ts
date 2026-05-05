import { DataSource } from 'typeorm';
import { Product } from '../src/modules/product/entities/product.entity';
import * as dotenv from 'dotenv';

dotenv.config();

async function setStockToThree() {
  const dataSource = new DataSource({
    type: 'postgres',
    url: process.env.DB_URL,
    ssl: { rejectUnauthorized: false },
    entities: [Product],
  });

  await dataSource.initialize();
  
  const product = await dataSource.getRepository(Product).findOne({ where: { id: '081c9020-8cd6-4ddf-9edd-9d0e0f4bbcac' } });

  if (product) {
      console.log(`Product found: ${product.name}`);
      console.log(`Setting stock from ${product.stock} to 3 for race condition test.`);
      product.stock = 3;
      await dataSource.getRepository(Product).save(product);
      console.log('✅ Stock set to 3 successfully.');
  } else {
      console.log('❌ Product not found!');
  }

  await dataSource.destroy();
}

setStockToThree().catch(console.error);
