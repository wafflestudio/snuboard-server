import { MigrationInterface, QueryRunner } from 'typeorm';

export class initial1612566029208 implements MigrationInterface {
  name = 'initial1612566029208';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE TABLE `department` (`id` int NOT NULL AUTO_INCREMENT, `name` varchar(255) NOT NULL, `college` varchar(255) NOT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB',
    );
    await queryRunner.query(
      'CREATE TABLE `tag` (`id` int NOT NULL AUTO_INCREMENT, `name` varchar(255) NOT NULL, `departmentId` int NOT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB',
    );
    await queryRunner.query(
      'CREATE TABLE `user_tag` (`id` int NOT NULL AUTO_INCREMENT, `userId` int NOT NULL, `tagId` int NOT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB',
    );
    await queryRunner.query(
      'CREATE TABLE `notice_tag` (`id` int NOT NULL AUTO_INCREMENT, `noticeId` int NOT NULL, `tagId` int NOT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB',
    );
    await queryRunner.query(
      'CREATE TABLE `notice` (`id` int NOT NULL AUTO_INCREMENT, `title` varchar(255) NOT NULL, `contentText` mediumtext NOT NULL, `content` mediumtext NOT NULL, `createdAt` timestamp NOT NULL, `isPinned` tinyint NOT NULL DEFAULT 0, `link` varchar(1000) NOT NULL, `departmentId` int NOT NULL, INDEX `IDX_055f16899896d15b608f001b3f` (`createdAt`, `id`), PRIMARY KEY (`id`)) ENGINE=InnoDB',
    );
    await queryRunner.query(
      'CREATE TABLE `file` (`id` int NOT NULL AUTO_INCREMENT, `name` varchar(255) NOT NULL, `link` varchar(1000) NOT NULL, `noticeId` int NOT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB',
    );
    await queryRunner.query(
      'CREATE TABLE `user_notice` (`id` int NOT NULL AUTO_INCREMENT, `isScrapped` tinyint NOT NULL, `userId` int NOT NULL, `noticeId` int NOT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB',
    );
    await queryRunner.query(
      "CREATE TABLE `user` (`id` int NOT NULL AUTO_INCREMENT, `username` varchar(255) NOT NULL, `password` varchar(255) NOT NULL, `nickname` varchar(255) NOT NULL, `isActive` tinyint NOT NULL DEFAULT 1, `refreshToken` varchar(255) NOT NULL DEFAULT '', UNIQUE INDEX `IDX_78a916df40e02a9deb1c4b75ed` (`username`), UNIQUE INDEX `IDX_e2364281027b926b879fa2fa1e` (`nickname`), PRIMARY KEY (`id`)) ENGINE=InnoDB",
    );
    await queryRunner.query(
      'CREATE TABLE `keyword` (`id` int NOT NULL AUTO_INCREMENT, `name` varchar(255) NOT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB',
    );
    await queryRunner.query(
      'CREATE TABLE `user_keyword` (`id` int NOT NULL AUTO_INCREMENT, `userId` int NOT NULL, `keywordId` int NOT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB',
    );
    await queryRunner.query(
      'ALTER TABLE `tag` ADD CONSTRAINT `FK_6166aac6e5b6c0ed1a21285440b` FOREIGN KEY (`departmentId`) REFERENCES `department`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION',
    );
    await queryRunner.query(
      'ALTER TABLE `user_tag` ADD CONSTRAINT `FK_7cf25d8a11ccc18f04cbd8cb46c` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION',
    );
    await queryRunner.query(
      'ALTER TABLE `user_tag` ADD CONSTRAINT `FK_d1c8261be4e02dc1df64636250c` FOREIGN KEY (`tagId`) REFERENCES `tag`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION',
    );
    await queryRunner.query(
      'ALTER TABLE `notice_tag` ADD CONSTRAINT `FK_b10c35e2f280634dcc5184229dc` FOREIGN KEY (`noticeId`) REFERENCES `notice`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION',
    );
    await queryRunner.query(
      'ALTER TABLE `notice_tag` ADD CONSTRAINT `FK_5786d9d1e48bf3048b6c1d4a4f1` FOREIGN KEY (`tagId`) REFERENCES `tag`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION',
    );
    await queryRunner.query(
      'ALTER TABLE `notice` ADD CONSTRAINT `FK_a79197d19d4b3d8c1ec0e96ef68` FOREIGN KEY (`departmentId`) REFERENCES `department`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION',
    );
    await queryRunner.query(
      'ALTER TABLE `file` ADD CONSTRAINT `FK_fca9b7b332e3efc00282c776e4c` FOREIGN KEY (`noticeId`) REFERENCES `notice`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION',
    );
    await queryRunner.query(
      'ALTER TABLE `user_notice` ADD CONSTRAINT `FK_f8e41a3637b784107fc82a431b5` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION',
    );
    await queryRunner.query(
      'ALTER TABLE `user_notice` ADD CONSTRAINT `FK_210a3a2884abd3a2b63f1899977` FOREIGN KEY (`noticeId`) REFERENCES `notice`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION',
    );
    await queryRunner.query(
      'ALTER TABLE `user_keyword` ADD CONSTRAINT `FK_19dc8bfc295ce42a20018f748f6` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION',
    );
    await queryRunner.query(
      'ALTER TABLE `user_keyword` ADD CONSTRAINT `FK_2b3f246d4ba1da966b0aa8dfd64` FOREIGN KEY (`keywordId`) REFERENCES `keyword`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `user_keyword` DROP FOREIGN KEY `FK_2b3f246d4ba1da966b0aa8dfd64`',
    );
    await queryRunner.query(
      'ALTER TABLE `user_keyword` DROP FOREIGN KEY `FK_19dc8bfc295ce42a20018f748f6`',
    );
    await queryRunner.query(
      'ALTER TABLE `user_notice` DROP FOREIGN KEY `FK_210a3a2884abd3a2b63f1899977`',
    );
    await queryRunner.query(
      'ALTER TABLE `user_notice` DROP FOREIGN KEY `FK_f8e41a3637b784107fc82a431b5`',
    );
    await queryRunner.query(
      'ALTER TABLE `file` DROP FOREIGN KEY `FK_fca9b7b332e3efc00282c776e4c`',
    );
    await queryRunner.query(
      'ALTER TABLE `notice` DROP FOREIGN KEY `FK_a79197d19d4b3d8c1ec0e96ef68`',
    );
    await queryRunner.query(
      'ALTER TABLE `notice_tag` DROP FOREIGN KEY `FK_5786d9d1e48bf3048b6c1d4a4f1`',
    );
    await queryRunner.query(
      'ALTER TABLE `notice_tag` DROP FOREIGN KEY `FK_b10c35e2f280634dcc5184229dc`',
    );
    await queryRunner.query(
      'ALTER TABLE `user_tag` DROP FOREIGN KEY `FK_d1c8261be4e02dc1df64636250c`',
    );
    await queryRunner.query(
      'ALTER TABLE `user_tag` DROP FOREIGN KEY `FK_7cf25d8a11ccc18f04cbd8cb46c`',
    );
    await queryRunner.query(
      'ALTER TABLE `tag` DROP FOREIGN KEY `FK_6166aac6e5b6c0ed1a21285440b`',
    );
    await queryRunner.query('DROP TABLE `user_keyword`');
    await queryRunner.query('DROP TABLE `keyword`');
    await queryRunner.query(
      'DROP INDEX `IDX_e2364281027b926b879fa2fa1e` ON `user`',
    );
    await queryRunner.query(
      'DROP INDEX `IDX_78a916df40e02a9deb1c4b75ed` ON `user`',
    );
    await queryRunner.query('DROP TABLE `user`');
    await queryRunner.query('DROP TABLE `user_notice`');
    await queryRunner.query('DROP TABLE `file`');
    await queryRunner.query(
      'DROP INDEX `IDX_055f16899896d15b608f001b3f` ON `notice`',
    );
    await queryRunner.query('DROP TABLE `notice`');
    await queryRunner.query('DROP TABLE `notice_tag`');
    await queryRunner.query('DROP TABLE `user_tag`');
    await queryRunner.query('DROP TABLE `tag`');
    await queryRunner.query('DROP TABLE `department`');
  }
}
