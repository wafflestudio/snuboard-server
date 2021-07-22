import { MigrationInterface, QueryRunner } from 'typeorm';

export class addstyle1626857595378 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "alter table department add style varchar(255) not null default ''",
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('alter table department drop style');
  }
}
