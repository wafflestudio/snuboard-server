import { MigrationInterface, QueryRunner } from 'typeorm';

export class removeEmailUnique1628413796983 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('alter table user drop index email');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'alter table user modify `email` varchar(255) not null unique',
    );
  }
}
