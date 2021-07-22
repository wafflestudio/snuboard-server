import { MigrationInterface, QueryRunner } from 'typeorm';

export class nicknameToEmail1626857613721 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'alter table user change `nickname` `email` varchar(255) not null unique',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'alter table user change `email` `nickname` varchar(255) not null unique',
    );
  }
}
