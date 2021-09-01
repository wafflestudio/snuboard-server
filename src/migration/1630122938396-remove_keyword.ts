import { MigrationInterface, QueryRunner } from 'typeorm';

export class removeKeyword1630122938396 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE `user_keyword`');
    await queryRunner.query('DROP TABLE `keyword`');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE TABLE `keyword` (`id` int NOT NULL AUTO_INCREMENT, `name` varchar(255) NOT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB',
    );
    await queryRunner.query(
      'CREATE TABLE `user_keyword` (`id` int NOT NULL AUTO_INCREMENT, `userId` int NOT NULL, `keywordId` int NOT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB',
    );
  }
}
