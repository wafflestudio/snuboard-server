import {
  BaseEntity,
  BeforeInsert,
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';

import * as bcrypt from 'bcrypt';
import { UserNotice } from '../notice/notice.entity';
import { UserTag } from '../department/department.entity';

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  username: string;

  @Exclude()
  @Column()
  password: string;

  @Column()
  nickname: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: '' })
  refreshToken: string;

  @OneToMany(() => Keyword, (keyword) => keyword.user)
  keywords: Keyword[];

  @OneToMany(() => UserNotice, (userNotice) => userNotice.user)
  userNotices: UserNotice[];

  @OneToMany(() => UserTag, (userTag) => userTag.user)
  userTags: UserTag[];

  @BeforeInsert()
  async hashPassword() {
    this.password = await bcrypt.hash(this.password, process.env.SALT_ROUND);
  }
}

@Entity()
export class Keyword extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @ManyToOne(() => User, (user) => user.keywords, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  user!: User;
}
