import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateBuyerProfilesTable1777455721299 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE buyer_profiles (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID NOT NULL UNIQUE,
                company_name VARCHAR,
                address TEXT,
                city VARCHAR,
                state VARCHAR,
                zipcode VARCHAR,
                company_phone VARCHAR,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await queryRunner.query(`
            ALTER TABLE buyer_profiles
            ADD CONSTRAINT fk_buyer_profiles_user
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE buyer_profiles DROP CONSTRAINT IF EXISTS fk_buyer_profiles_user`);
        await queryRunner.query(`DROP TABLE IF EXISTS buyer_profiles`);
    }

}
