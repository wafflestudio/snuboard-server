import { MigrationInterface, QueryRunner } from 'typeorm';

export class setDefaultTimestamp1626177689912 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "alter table notice modify createdAt timestamp  not null default '1970-01-01 09:00:01'",
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'alter table notice modify createdAt timestamp  not null default current_timestamp on update current_timestamp',
    );
  }
}
