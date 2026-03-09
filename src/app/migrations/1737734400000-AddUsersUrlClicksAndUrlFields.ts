import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class AddUsersUrlClicksAndUrlFields1737734400000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Create users table
    await queryRunner.createTable(
      new Table({
        name: 'users',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          { name: 'email', type: 'varchar', isUnique: true },
          { name: 'passwordHash', type: 'varchar' },
          { name: 'createdAt', type: 'timestamp', default: 'now()' },
          { name: 'updatedAt', type: 'timestamp', default: 'now()' },
        ],
      }),
      true,
    );

    // 2. Add new columns to urls
    await queryRunner.query(`
      ALTER TABLE "urls"
      ADD COLUMN "redirectPermanent" boolean NOT NULL DEFAULT false,
      ADD COLUMN "lastClickedAt" timestamp,
      ADD COLUMN "userId" uuid
    `);

    await queryRunner.createForeignKey(
      'urls',
      new TableForeignKey({
        columnNames: ['userId'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    );

    // 3. Create url_clicks table
    await queryRunner.createTable(
      new Table({
        name: 'url_clicks',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          { name: 'urlId', type: 'uuid' },
          { name: 'clickedAt', type: 'timestamp', default: 'now()' },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'url_clicks',
      new TableForeignKey({
        columnNames: ['urlId'],
        referencedTableName: 'urls',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop url_clicks and its FK
    const urlClicksTable = await queryRunner.getTable('url_clicks');
    if (urlClicksTable) {
      const fk = urlClicksTable.foreignKeys.find(
        (f) => f.columnNames.indexOf('urlId') !== -1,
      );
      if (fk) await queryRunner.dropForeignKey('url_clicks', fk);
    }
    await queryRunner.dropTable('url_clicks', true);

    // Drop userId FK and new columns from urls
    const urlsTable = await queryRunner.getTable('urls');
    if (urlsTable) {
      const fk = urlsTable.foreignKeys.find(
        (f) => f.columnNames.indexOf('userId') !== -1,
      );
      if (fk) await queryRunner.dropForeignKey('urls', fk);
    }
    await queryRunner.query(`
      ALTER TABLE "urls"
      DROP COLUMN "redirectPermanent",
      DROP COLUMN "lastClickedAt",
      DROP COLUMN "userId"
    `);

    await queryRunner.dropTable('users', true);
  }
}
