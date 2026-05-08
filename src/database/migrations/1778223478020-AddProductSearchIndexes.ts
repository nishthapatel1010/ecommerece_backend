import { MigrationInterface, QueryRunner } from "typeorm";

export class AddProductSearchIndexes1778223478020 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Enable necessary PostgreSQL extensions
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS pg_trgm;`);
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS fuzzystrmatch;`);

        // Create the Trigram index for fuzzy matching (%) and ILIKE
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "idx_product_name_trgm" 
            ON "products" USING GIN ("name" gin_trgm_ops);
        `);

        // Create the Full-Text Search index for sentence matching (plainto_tsquery)
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "idx_product_name_fts" 
            ON "products" USING GIN (to_tsvector('english', "name"));
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX IF EXISTS "idx_product_name_fts";`);
        await queryRunner.query(`DROP INDEX IF EXISTS "idx_product_name_trgm";`);
    }
}