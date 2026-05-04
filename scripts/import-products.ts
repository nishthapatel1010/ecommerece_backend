import 'dotenv/config';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import axios from 'axios';
import { v2 as cloudinary } from 'cloudinary';
import { AppDataSource } from '../src/database/data-source';
import { Product } from '../src/modules/product/entities/product.entity';

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const JSON_FILE_PATH = path.join(__dirname, '../output.json');
const BATCH_SIZE = 15;

async function readJsonFile() {
  if (!fs.existsSync(JSON_FILE_PATH)) {
    throw new Error(`File not found: ${JSON_FILE_PATH}`);
  }
  const fileContent = fs.readFileSync(JSON_FILE_PATH, 'utf-8');
  return JSON.parse(fileContent);
}

async function downloadImage(url: string): Promise<NodeJS.ReadableStream> {
  const response = await axios({
    method: 'GET',
    url: url,
    responseType: 'stream',
  });
  return response.data;
}

async function uploadToCloudinary(imageStream: NodeJS.ReadableStream, productId: string, sku: string, originalUrl: string) {
  // Preserve extension
  const ext = path.extname(new URL(originalUrl).pathname) || '.jpg';
  const folderPath = `samples/Beautyshop_ecommerce/${productId}/${sku}`;
  
  return new Promise<any>((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folderPath,
        use_filename: false,
        resource_type: 'image',
        format: ext.replace('.', ''), // ensure extension is preserved
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    imageStream.pipe(uploadStream);
  });
}

async function checkDuplicate(repo: any, externalId?: string, sku?: string) {
  const query = repo.createQueryBuilder('product');
  if (externalId && sku) {
    query.where('product.itemNumber = :externalId OR product.sku = :sku', { externalId, sku });
  } else if (externalId) {
    query.where('product.itemNumber = :externalId', { externalId });
  } else if (sku) {
    query.where('product.sku = :sku', { sku });
  } else {
    return false; // No identifier to check against
  }
  
  const count = await query.getCount();
  return count > 0;
}

async function insertProduct(repo: any, productData: any) {
  const product = repo.create(productData);
  await repo.save(product);
  return product;
}

async function processProduct(item: any, repo: any) {
  try {
    // We generate the UUID here so it can be used for Cloudinary folder path
    const productId = crypto.randomUUID();
    
    // Follow strict order requested:
    // 3. Download image
    // 4. Upload to Cloudinary
    // 5. Replace image URL fields
    let cloudinaryResult: any = null;
    if (item.image_url) {
      try {
        const stream = await downloadImage(item.image_url);
        cloudinaryResult = await uploadToCloudinary(stream, productId, item.sku || 'no-sku', item.image_url);
      } catch (imgError: any) {
        console.warn(`[WARNING] Could not process image for ${item.id}. Proceeding without image. Error: ${imgError.message}`);
      }
    }

    // 6. Check duplicates
    const isDuplicate = await checkDuplicate(repo, item.id, item.sku);
    if (isDuplicate) {
      console.log(`[SKIPPED] Product already exists (ext_id: ${item.id}, sku: ${item.sku})`);
      return;
    }

    // 7. Insert into DB (using your existing database schema columns)
    const productData = {
      id: productId,
      itemNumber: item.id || null, // Map external id to your item_number column
      sku: item.sku || null,
      upc: item.upc || null,
      name: item.name,
      imageUrl: cloudinaryResult ? cloudinaryResult.secure_url : null, // Save Cloudinary URL here
      basePrice: item.price ? parseFloat(item.price) : null,
      size: item.size || null,
      available: item.available !== undefined ? item.available : true,
    };

    const inserted = await insertProduct(repo, productData);
    
    // 8. Log result
    console.log(`[SUCCESS] Inserted product ID: ${inserted.id} | Cloudinary: ${productData.imageUrl}`);
  } catch (err: any) {
    console.error(`[FAILED] Failed to process product (ext_id: ${item.id}):`, err.message);
  }
}

async function mainRunner() {
  try {
    console.log('Initializing database connection...');
    await AppDataSource.initialize();
    console.log('Database connected.');

    const productRepo = AppDataSource.getRepository(Product);

    // 1. Read output.json
    const products = await readJsonFile();
    console.log(`Found ${products.length} products to process.`);

    // 2. Loop products in batches
    for (let i = 0; i < products.length; i += BATCH_SIZE) {
      const batch = products.slice(i, i + BATCH_SIZE);
      console.log(`\n--- Processing Batch ${i / BATCH_SIZE + 1} (${batch.length} items) ---`);
      
      const promises = batch.map((item: any) => processProduct(item, productRepo));
      
      // Wait for all products in the batch to finish
      await Promise.allSettled(promises);
      
      // 9. Continue batch processing
    }

    console.log('\nImport process completed successfully.');
  } catch (error) {
    console.error('Fatal error during import:', error);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
}

mainRunner();
