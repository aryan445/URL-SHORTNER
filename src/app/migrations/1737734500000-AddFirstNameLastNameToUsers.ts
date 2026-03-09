import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFirstNameLastNameToUsers1737734500000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users"
      ADD COLUMN "firstName" varchar,
      ADD COLUMN "lastName" varchar
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users"
      DROP COLUMN "firstName",
      DROP COLUMN "lastName"
    `);
  }
}
