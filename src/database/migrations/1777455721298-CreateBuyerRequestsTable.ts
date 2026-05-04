import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateBuyerRequestsTable1777455721298 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TYPE buyer_request_status_enum AS ENUM ('pending', 'approved', 'rejected')
        `);

        await queryRunner.query(`
            CREATE TABLE buyer_requests (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID NOT NULL,
                company_name VARCHAR,
                address TEXT,
                city VARCHAR,
                state VARCHAR,
                zipcode VARCHAR,
                company_phone VARCHAR,
                status buyer_request_status_enum DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await queryRunner.query(`
            ALTER TABLE buyer_requests
            ADD CONSTRAINT fk_buyer_requests_user
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        `);

        await queryRunner.query(`CREATE INDEX idx_buyer_requests_user_id ON buyer_requests(user_id)`);
        await queryRunner.query(`CREATE INDEX idx_buyer_requests_status ON buyer_requests(status)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX IF EXISTS idx_buyer_requests_status`);
        await queryRunner.query(`DROP INDEX IF EXISTS idx_buyer_requests_user_id`);
        await queryRunner.query(`DROP TABLE IF EXISTS buyer_requests`);
        await queryRunner.query(`DROP TYPE IF EXISTS buyer_request_status_enum`);
    }

}
