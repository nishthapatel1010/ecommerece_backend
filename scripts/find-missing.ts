import 'dotenv/config';
import * as fs from 'fs';
import * as path from 'path';
import { AppDataSource } from '../src/database/data-source';
import { Product } from '../src/modules/product/entities/product.entity';

const JSON_FILE_PATH = path.join(__dirname, '../output.json');

async function findMissingProducts() {
  try {
    await AppDataSource.initialize();
    
    // Read JSON file
    const fileContent = fs.readFileSync(JSON_FILE_PATH, 'utf-8');
    const jsonProducts: any[] = JSON.parse(fileContent);
    
    // Find internal duplicates in the JSON itself
    const seenIds = new Set();
    const internalDuplicates = [];
    
    for (const item of jsonProducts) {
      if (seenIds.has(item.id)) {
        internalDuplicates.push(item);
      } else {
        seenIds.add(item.id);
      }
    }
    
    console.log(`\n--- JSON Analysis ---`);
    console.log(`Total items in JSON: ${jsonProducts.length}`);
    console.log(`Unique items in JSON (by ID): ${seenIds.size}`);
    if (internalDuplicates.length > 0) {
      console.log(`\nFound ${internalDuplicates.length} DUPLICATES directly inside the JSON file!`);
      // print first 5 duplicates
      internalDuplicates.slice(0, 5).forEach(d => console.log(`  - Duplicate ID: ${d.id} | Name: ${d.name}`));
      if (internalDuplicates.length > 5) console.log(`  ...and ${internalDuplicates.length - 5} more.`);
    }

    // Get all item_numbers currently in the Database
    const productRepo = AppDataSource.getRepository(Product);
    const dbProducts = await productRepo.find({ select: ['itemNumber', 'sku'] });
    
    const dbItemNumbers = new Set(dbProducts.map(p => p.itemNumber));
    
    console.log(`\n--- Database Comparison ---`);
    console.log(`Total items in Database: ${dbProducts.length}`);
    
    // Find which unique JSON items are NOT in the database
    const missingItems = [];
    const uniqueJsonProducts = jsonProducts.filter((item, index, self) => 
      index === self.findIndex((t) => t.id === item.id)
    );

    for (const item of uniqueJsonProducts) {
      if (!dbItemNumbers.has(item.id)) {
        missingItems.push(item);
      }
    }
    
    console.log(`\nItems missing from Database: ${missingItems.length}`);
    if (missingItems.length > 0) {
      console.log(`\nThese items were skipped (likely due to invalid image URLs or download failures):`);
      missingItems.forEach(m => console.log(`  - ID: ${m.id} | Name: ${m.name}`));
    }
    
  } catch (err) {
    console.error('Error:', err);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
}

findMissingProducts();
