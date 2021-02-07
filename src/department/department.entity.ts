import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../user/user.entity';
import { Notice } from '../notice/notice.entity';

@Entity()
export class Department extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @OneToMany(() => Notice, (notice) => notice.department)
  notices: Notice[];

  @OneToMany(() => Tag, (tag) => tag.department)
  tags: Tag[];
}

@Entity()
export class Tag extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @ManyToOne(() => Department, (department) => department.tags)
  department: Department;

  @OneToMany(() => UserTag, (userTag) => userTag.tag)
  userTags: UserTag[];

  @OneToMany(() => NoticeTag, (noticeTag) => noticeTag.tag)
  noticeTags: NoticeTag[];
}

@Entity()
export class UserTag extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.userTags)
  user: User;

  @ManyToOne(() => Tag, (tag) => tag.userTags)
  tag: Tag;
}

@Entity()
export class NoticeTag extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Notice, (notice) => notice.noticeTags)
  notice: Notice;

  @ManyToOne(() => Tag, (tag) => tag.noticeTags)
  tag: Tag;
}
