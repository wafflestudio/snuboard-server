import {
  BaseEntity,
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  FindConditions,
  JoinColumn,
  JoinTable,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Exclude, Expose } from 'class-transformer';

import * as bcrypt from 'bcrypt';
import { UserNotice } from '../notice/notice.entity';
import { UserTag } from '../department/department.entity';

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({
    unique: true,
  })
  username!: string;

  @Exclude()
  @Column()
  password!: string;

  @Column()
  email!: string;

  @Exclude()
  @Column({ default: true })
  isActive!: boolean;

  @Exclude()
  @Column({ default: '' })
  refreshToken!: string;

  @Exclude()
  @OneToMany(() => UserKeyword, (userKeyword) => userKeyword.user)
  userKeywords!: UserKeyword[];

  @OneToMany(() => UserNotice, (userNotice) => userNotice.user)
  userNotices!: UserNotice[];

  @OneToMany(() => UserTag, (userTag) => userTag.user)
  userTags!: UserTag[];

  @Expose()
  get keywords(): string[] {
    return this.userKeywords
      ? this.userKeywords.map((userKeyword) => userKeyword.keyword.name)
      : [];
  }

  access_token?: string;
  refresh_token?: string;

  static async findOneIfRefreshTokenMatches(
    refreshToken: string,
    id: number,
  ): Promise<User | undefined> {
    const user: User | undefined = await this.findOne(id);
    if (!user) return undefined;

    if (await bcrypt.compare(refreshToken, user.refreshToken)) {
      return user;
    }

    return undefined;
  }

  static findOneWithKeyword(
    payload: FindConditions<User>,
  ): Promise<User | undefined> {
    return this.findOne(payload, {
      relations: ['userKeywords', 'userKeywords.keyword'],
    });
  }

  async getSubscribedTags() {
    const userTags = await UserTag.find({
      where: [{ user: this }],
      relations: ['tag', 'user', 'tag.department'],
    });

    return userTags.map((userTag) => {
      return userTag.tag;
    });
  }
}

@Entity()
export class Keyword extends BaseEntity {
  @Exclude()
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @OneToMany(() => UserKeyword, (userKeyword) => userKeyword.keyword)
  userKeywords!: UserKeyword[];
}

@Entity()
export class UserKeyword extends BaseEntity {
  @Exclude()
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User, (user) => user.userKeywords, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  user!: User;

  @ManyToOne(() => Keyword, (keyword) => keyword.userKeywords, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  keyword!: Keyword;
}
