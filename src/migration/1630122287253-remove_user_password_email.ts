import { MigrationInterface, QueryRunner } from 'typeorm';

export class removeUserPasswordEmail1630122287253
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('alter table user drop password');
    await queryRunner.query('alter table user drop email');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "alter table user add email varchar(255) not null default ''",
    );
    await queryRunner.query(
      "alter table user add password varchar(255) not null default ''",
    );
  }
}
