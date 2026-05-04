import { AppDataSource } from './src/database/data-source';
import { Product } from './src/modules/product/entities/product.entity';

async function check() {
  await AppDataSource.initialize();
  const products = await AppDataSource.getRepository(Product).find({ take: 5 });
  console.log(JSON.stringify(products, null, 2));
  await AppDataSource.destroy();
}

check();
