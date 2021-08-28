import {
  BaseEntity,
  Column,
  Entity,
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
  id!: number;

  @Exclude()
  @Column({
    unique: true,
  })
  username!: string;

  @Exclude()
  @Column({ default: true })
  isActive!: boolean;

  @Exclude()
  @Column({ default: '' })
  refreshToken!: string;

  @OneToMany(() => UserNotice, (userNotice) => userNotice.user)
  userNotices!: UserNotice[];

  @OneToMany(() => UserTag, (userTag) => userTag.user)
  userTags!: UserTag[];

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
