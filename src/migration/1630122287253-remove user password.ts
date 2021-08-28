import { MigrationInterface, QueryRunner } from 'typeorm';

export class removeUserPassword1630122287253 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('alter table user drop password');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "alter table department add password varchar(255) not null default ''",
    );
  }
}
